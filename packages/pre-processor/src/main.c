#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "sqlite3.h"

#define M_PI 3.14159265358979323846
#define MAX_ZOOM_LEVEL 8
#define TILE_PIXEL_SIZE 256

#ifdef _WIN32
int __stdcall SetConsoleOutputCP(unsigned int wCodePageID);
int DeleteFileA(const char *lpFileName);
int QueryPerformanceFrequency(int64_t *lpFrequency);
int QueryPerformanceCounter(int64_t *lpPerformanceCount);
#endif

const char INIT_QUERY[] =
"CREATE TABLE publications ("
"	publication_id INTEGER NOT NULL,"
"	publication_title TEXT NOT NULL,"
"	publication_author TEXT NOT NULL,"
"	publication_year INTEGER NOT NULL,"
"	PRIMARY KEY (publication_id)"
");"
"CREATE TABLE places ("
"	place_id INTEGER NOT NULL,"
"	place_name TEXT NOT NULL UNIQUE,"
"	place_lat REAL NOT NULL,"
"	place_lon REAL NOT NULL,"
"	PRIMARY KEY (place_id)"
");"
"CREATE TABLE publication_places ("
"	publication_id INTEGER NOT NULL,"
"	place_id INTEGER NOT NULL,"
"	PRIMARY KEY (publication_id, place_id),"
"	FOREIGN KEY (publication_id) REFERENCES publications (publication_id),"
"	FOREIGN KEY (place_id) REFERENCES places (place_id)"
");"
"CREATE TABLE tiles ("
"	tile_id INTEGER NOT NULL,"
"	tile_x INTEGER NOT NULL,"
"	tile_y INTEGER NOT NULL,"
"	tile_z INTEGER NOT NULL,"
"	tile_t INTEGER NOT NULL,"
"	PRIMARY KEY (tile_id)"
");"
"CREATE TABLE tile_stats ("
"	tile_t INTEGER NOT NULL,"
"	tile_z INTEGER NOT NULL,"
"	publication_count INTEGER NOT NULL,"
"	PRIMARY KEY (tile_t, tile_z)"
");"
"CREATE TABLE tile_points ("
"	tile_id INTEGER NOT NULL,"
"	point_x INTEGER NOT NULL,"
"	point_y INTEGER NOT NULL,"
"	publication_id INTEGER NOT NULL,"
"	PRIMARY KEY (tile_id, point_x, point_y, publication_id),"
"	FOREIGN KEY (tile_id) REFERENCES tiles (tile_id),"
"	FOREIGN KEY (publication_id) REFERENCES publications (publication_id)"
");"
"CREATE UNIQUE INDEX place_name ON places (place_name);"
"CREATE UNIQUE INDEX tile_coords ON tiles (tile_x, tile_y, tile_z, tile_t);";

sqlite3 *in_db;
sqlite3 *out_db;

typedef struct TileCoord {
	int tileX;
	int tileY;
	int pixelX;
	int pixelY;
} TileCoord;

static float RandFloat() { return (float)rand() / (RAND_MAX + 1.0f); }
static float RandFloatRange(float a, float b) { return a + RandFloat() * (b - a); }

static TileCoord GeoCoordToTileCoord(double lonDeg, double latDeg, int z)
{
	double x = (lonDeg + 180.0) / 360.0 * (1 << z);
	double latRad = latDeg * M_PI / 180.0;
	double y = (1.0 - asinh(tan(latRad)) / M_PI) / 2.0 * (1 << z);

	return (TileCoord){
		.tileX = (int)floor(x),
		.tileY = (int)floor(y),
		.pixelX = (int)floor(TILE_PIXEL_SIZE * fmod(x, 1.0)),
		.pixelY = (int)floor(TILE_PIXEL_SIZE * fmod(y, 1.0)),
	};
}

#ifndef _WIN32
static void timespec_diff(struct timespec *a, struct timespec *b, struct timespec *result)
{
	result->tv_sec = a->tv_sec - b->tv_sec;
	result->tv_nsec = a->tv_nsec - b->tv_nsec;
	if (result->tv_nsec < 0)
	{
		--result->tv_sec;
		result->tv_nsec += 1000000000L;
	}
}
#endif

static int64_t GetInt64(sqlite3 *db, const char *query)
{
	sqlite3_stmt *stmt;

	sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
	sqlite3_step(stmt);

	int64_t ret = sqlite3_column_int64(stmt, 0);
	sqlite3_finalize(stmt);
	return ret;
}

static int64_t GetOrInsertPlace(const char *placeName, int placeNameSize)
{
	int res;
	sqlite3_stmt *stmt;

	int64_t id;

	sqlite3_prepare_v2(out_db, "SELECT place_id FROM places WHERE place_name = ?", -1, &stmt, NULL);
	sqlite3_bind_text(stmt, 1, placeName, placeNameSize, SQLITE_STATIC);
	res = sqlite3_step(stmt);

	// get existing place id
	if (res == SQLITE_ROW)
	{
		id = sqlite3_column_int64(stmt, 0);
		sqlite3_finalize(stmt);
		return id;
	}
	// insert new place and get id
	else
	{
		sqlite3_finalize(stmt);
		sqlite3_prepare_v2(out_db, "INSERT INTO places (place_name, place_lat, place_lon) VALUES (?, ?, ?)", -1, &stmt, NULL);
		sqlite3_bind_text(stmt, 1, placeName, placeNameSize, SQLITE_STATIC);
		sqlite3_bind_double(stmt, 2, RandFloatRange(-90.0f, 90.0f));
		sqlite3_bind_double(stmt, 3, RandFloatRange(-180.0f, 180.0f));
		sqlite3_step(stmt);
		id = sqlite3_last_insert_rowid(out_db);
		sqlite3_finalize(stmt);
		return id;
	}
}

static int64_t GetOrInsertTile(int x, int y, int z, int t)
{
	int res;
	sqlite3_stmt *stmt;

	int64_t id;

	sqlite3_prepare_v2(out_db, "SELECT tile_id FROM tiles WHERE tile_x = ? AND tile_y = ? AND tile_z = ? AND tile_t = ?", -1, &stmt, NULL);
	sqlite3_bind_int(stmt, 1, x);
	sqlite3_bind_int(stmt, 2, y);
	sqlite3_bind_int(stmt, 3, z);
	sqlite3_bind_int(stmt, 4, t);
	res = sqlite3_step(stmt);

	if (res == SQLITE_ROW)
	{
		id = sqlite3_column_int64(stmt, 0);
		sqlite3_finalize(stmt);
		return id;
	}
	else
	{
		sqlite3_finalize(stmt);
		sqlite3_prepare_v2(out_db, "INSERT INTO tiles (tile_x, tile_y, tile_z, tile_t) VALUES (?, ?, ?, ?)", -1, &stmt, NULL);
		sqlite3_bind_int(stmt, 1, x);
		sqlite3_bind_int(stmt, 2, y);
		sqlite3_bind_int(stmt, 3, z);
		sqlite3_bind_int(stmt, 4, t);
		sqlite3_step(stmt);
		id = sqlite3_last_insert_rowid(out_db);
		sqlite3_finalize(stmt);
		return id;
	}
}

static void Init(const char *dbFilename)
{
	#ifdef _WIN32
		DeleteFileA(dbFilename);
	#else
		remove(dbFilename);
	#endif
	sqlite3_open(dbFilename, &out_db);

	printf("Executing init query...\n");
	char *error;
	int res = sqlite3_exec(out_db, INIT_QUERY, NULL, NULL, &error);
	if (res)
	{
		fprintf(stderr, "%s\n", error);
	}
	sqlite3_free(error);

	sqlite3_close(out_db);
}

static void Extract(const char *intputDbFilename, const char *outputDbFilename)
{
	sqlite3_open(intputDbFilename, &in_db);
	sqlite3_open(outputDbFilename, &out_db);

	printf("Counting books...\n");
	int64_t bookCount = GetInt64(in_db, "SELECT COUNT(*) FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''");
	printf("There are %" PRId64 " books with geographic names.\n", bookCount);

	sqlite3_stmt *stmt_select;
	sqlite3_stmt *stmt_insert_publication;
	sqlite3_stmt *stmt_insert_publication_place;

	sqlite3_prepare_v2(in_db, "SELECT TITLE, YEAR, GEOGRAPHIC_NAMES FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''", -1, &stmt_select, NULL);
	sqlite3_prepare_v2(out_db, "INSERT INTO publications (publication_title, publication_author, publication_year) VALUES (?, ?, ?)", -1, &stmt_insert_publication, NULL);
	sqlite3_prepare_v2(out_db, "INSERT INTO publication_places (publication_id, place_id) VALUES (?, ?)", -1, &stmt_insert_publication_place, NULL);

	sqlite3_exec(out_db, "BEGIN TRANSACTION", NULL, NULL, NULL);

	sqlite3_exec(out_db,
		"DELETE FROM tile_points;"
		"DELETE FROM publication_places;"
		"DELETE FROM tiles;"
		"DELETE FROM places;"
		"DELETE FROM publications;",
	NULL, NULL, NULL);

	int64_t iBook = 0;
	while (sqlite3_step(stmt_select) == SQLITE_ROW)
	{
		iBook += 1;
		if (iBook % 10000 == 0)
		{
			printf("Book %" PRId64 "/%" PRId64 " (%.2f%%)\n", iBook, bookCount, 100.0 * (iBook - 1) / bookCount);
		}

		// --- INSERT BOOK ---

		const char* title = (const char*)sqlite3_column_text(stmt_select, 0);
		const char* author = "N/A";
		int year = sqlite3_column_int(stmt_select, 1);

		sqlite3_reset(stmt_insert_publication);
		sqlite3_bind_text(stmt_insert_publication, 1, title, -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt_insert_publication, 2, author, -1, SQLITE_STATIC);
		sqlite3_bind_int(stmt_insert_publication, 3, year);
		sqlite3_step(stmt_insert_publication);

		int64_t publicationID = sqlite3_last_insert_rowid(out_db);

		// --- INSERT PLACES ---

		const char *geoNames = (const char*)sqlite3_column_text(stmt_select, 2);
		while (true)
		{
			const char *sep = strstr(geoNames, " , ");
			int len = sep ? (int)(sep - geoNames) : -1;

			int64_t placeID = GetOrInsertPlace(geoNames, len);

			sqlite3_reset(stmt_insert_publication_place);
			sqlite3_bind_int64(stmt_insert_publication_place, 1, publicationID);
			sqlite3_bind_int64(stmt_insert_publication_place, 2, placeID);
			sqlite3_step(stmt_insert_publication_place);

			if (!sep) break;
			geoNames = sep + 3;
		}
	}

	sqlite3_exec(out_db, "COMMIT", NULL, NULL, NULL);

	sqlite3_finalize(stmt_select);
	sqlite3_finalize(stmt_insert_publication);
	sqlite3_finalize(stmt_insert_publication_place);

	sqlite3_close(in_db);
	sqlite3_close(out_db);
}

static void Precalculate(const char *dbFilename)
{
	sqlite3_open(dbFilename, &out_db);

	printf("Counting publication-place entries...\n");
	int64_t pulicationPlaceCount = GetInt64(out_db, "SELECT COUNT(*) FROM publication_places");
	printf("There are %" PRId64 " publication-place entries.\n", pulicationPlaceCount);

	sqlite3_stmt *stmt_query;
	sqlite3_stmt *stmt_insert;

	sqlite3_prepare_v2(out_db, "SELECT publication_id, place_lat, place_lon, publication_year FROM publication_places NATURAL JOIN places NATURAL JOIN publications", -1, &stmt_query, NULL);
	sqlite3_prepare_v2(out_db, "INSERT INTO tile_points (tile_id, point_x, point_y, publication_id) VALUES (?, ?, ?, ?)", -1, &stmt_insert, NULL);

	sqlite3_exec(out_db, "BEGIN TRANSACTION", NULL, NULL, NULL);

	sqlite3_exec(out_db,
		"DELETE FROM tile_points;"
		"DELETE FROM tiles;",
	NULL, NULL, NULL);

	int64_t iPublicationPlace = 0;
	while (sqlite3_step(stmt_query) == SQLITE_ROW)
	{
		iPublicationPlace += 1;
		if (iPublicationPlace % 10000 == 0)
		{
			printf("Entry %" PRId64 "/%" PRId64 " (%.2f%%)\n", iPublicationPlace, pulicationPlaceCount, 100.0 * (iPublicationPlace - 1) / pulicationPlaceCount);
		}

		int64_t publicationID = sqlite3_column_int64(stmt_query, 0);
		double lat = sqlite3_column_double(stmt_query, 1);
		double lon = sqlite3_column_double(stmt_query, 2);
		int t = sqlite3_column_int(stmt_query, 3);

		for (int z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			TileCoord tc = GeoCoordToTileCoord(lon, lat, z);
			int64_t tileID = GetOrInsertTile(tc.tileX, tc.tileY, z, t);

			sqlite3_reset(stmt_insert);
			sqlite3_bind_int64(stmt_insert, 1, tileID);
			sqlite3_bind_int(stmt_insert, 2, tc.pixelX);
			sqlite3_bind_int(stmt_insert, 3, tc.pixelY);
			sqlite3_bind_int64(stmt_insert, 4, publicationID);
			sqlite3_step(stmt_insert);
		}
	}

	sqlite3_finalize(stmt_query);
	sqlite3_finalize(stmt_insert);

	printf("Calculating tile stats...\n");

	// TODO It may work, but it takes too long.
	//sqlite3_exec(out_db,
	//	"INSERT INTO tile_stats\n"
	//	"WITH tile_stat (tile_t, tile_z, publication_count) AS (\n"
	//	"	SELECT tile_t, tile_z, COUNT(publication_id)\n"
	//	"	FROM tile_points NATURAL JOIN tiles\n"
	//	"	GROUP BY tile_id)\n"
	//	"SELECT tile_t, tile_z, MAX(publication_count) AS publication_count\n"
	//	"FROM tile_stat NATURAL JOIN tile_points\n"
	//	"GROUP BY tile_t, tile_z",
	//NULL, NULL, NULL);

	sqlite3_exec(out_db, "COMMIT", NULL, NULL, NULL);

	sqlite3_close(out_db);
}

static void Get(const char *dbFilename, int x, int y, int z, int t)
{
	sqlite3_open(dbFilename, &out_db);

	int res;
	sqlite3_stmt *stmt;

	int64_t tileID;

	sqlite3_prepare_v2(out_db, "SELECT tile_id FROM tiles WHERE tile_x = ? AND tile_y = ? AND tile_z = ? AND tile_t = ?", -1, &stmt, NULL);
	sqlite3_bind_int(stmt, 1, x);
	sqlite3_bind_int(stmt, 2, y);
	sqlite3_bind_int(stmt, 3, z);
	sqlite3_bind_int(stmt, 4, t);
	res = sqlite3_step(stmt);

	if (res == SQLITE_ROW)
	{
		tileID = sqlite3_column_int64(stmt, 0);
		sqlite3_finalize(stmt);

		printf("{\"x\":%d,\"y\":%d,\"z\":%d,\"t\":%d,\"points\":[", x, y, z, t);

		sqlite3_prepare_v2(out_db, "SELECT point_x, point_y, GROUP_CONCAT(publication_id) FROM tile_points WHERE tile_id = ? GROUP BY point_x, point_y ORDER BY point_y, point_x", -1, &stmt, NULL);
		sqlite3_bind_int64(stmt, 1, tileID);
		bool firstPublication = true;
		while (sqlite3_step(stmt) == SQLITE_ROW)
		{
			if (firstPublication) firstPublication = false;
			else printf(",");

			int pixelX = sqlite3_column_int(stmt, 0);
			int pixelY = sqlite3_column_int(stmt, 1);
			const char *publicationIDs = (const char*)sqlite3_column_text(stmt, 2);

			printf("{\"x\":%d,\"y\":%d,\"publications\":[%s]}", pixelX, pixelY, publicationIDs);
		}
		sqlite3_finalize(stmt);

		printf("]}\n");
	}
	else
	{
		printf("null\n");
	}

	sqlite3_close(out_db);
}

static void PrintJsonString(const char *str)
{
	printf("\"");
	while (*str)
	{
		char c = *str;

		if (c == '\\' || c == '"' || (c >= 0x00 && c <= 0x1F))
		{
			printf("\\u%04X", c);
		}
		else
		{
			fwrite(&c, 1, 1, stdout);
		}

		str += 1;
	}
	printf("\"");
}

static void Dump(const char *dbFilename)
{
	sqlite3_open(dbFilename, &out_db);
	printf("{");

	sqlite3_stmt *stmt;

	// --- DUMPING BOOKS ---
	fprintf(stderr, "Dumping publications...\n");

	printf("\"publications\":\n[");

	int64_t publicationCount = GetInt64(out_db, "SELECT COUNT(*) FROM publications");

	sqlite3_prepare_v2(out_db, "SELECT publication_id, publication_title, publication_author, publication_year FROM publications", -1, &stmt, NULL);

	int64_t iPublication = 0;
	bool firstPublication = true;
	while (sqlite3_step(stmt) == SQLITE_ROW)
	{
		iPublication += 1;
		if (iPublication % 10000 == 0)
		{
			fprintf(stderr, "Book %" PRId64 "/%" PRId64 " (%.2f%%)\n", iPublication, publicationCount, 100.0 * (iPublication - 1) / publicationCount);
		}

		if (firstPublication) firstPublication = false;
		else printf(",\n");

		int64_t publicationID = sqlite3_column_int64(stmt, 0);
		const char *title = (const char*)sqlite3_column_text(stmt, 1);
		const char *author = (const char*)sqlite3_column_text(stmt, 2);
		int year = sqlite3_column_int(stmt, 3);

		printf("{\"id\":%" PRId64 ",\"title\":", publicationID);
		PrintJsonString(title);
		printf(",\"author\":");
		PrintJsonString(author);
		printf(",\"places\":[],\"year\":%d}", year); // TODO Places for debug data.
	}
	sqlite3_finalize(stmt);

	printf("],\n");

	// --- DUMPING TILES ---
	fprintf(stderr, "Counting tiles...\n");
	int64_t tileCount = GetInt64(out_db, "SELECT COUNT(*) FROM tiles");
	fprintf(stderr, "There are %" PRId64 " tiles.\n", tileCount);
	int64_t iTile = 0;

	sqlite3_stmt *stmt_points;

	sqlite3_prepare_v2(out_db, "SELECT tile_id, tile_x, tile_y, tile_z, tile_t FROM tiles", -1, &stmt, NULL);
	sqlite3_prepare_v2(out_db, "SELECT point_x, point_y, GROUP_CONCAT(publication_id) FROM tile_points WHERE tile_id = ? GROUP BY point_x, point_y ORDER BY point_y, point_x", -1, &stmt_points, NULL);

	printf("\"preTiles\":[");
	bool firstTile = true;
	while (sqlite3_step(stmt) == SQLITE_ROW)
	{
		iTile += 1;
		if (iTile % 10000 == 0)
		{
			fprintf(stderr, "Tile %" PRId64 "/%" PRId64 " (%.2f%%)\n", iTile, tileCount, 100.0 * (iTile - 1) / tileCount);
		}

		if (firstTile) firstTile = false;
		else printf(",\n");

		int64_t tileID = sqlite3_column_int64(stmt, 0);
		int x = sqlite3_column_int(stmt, 1);
		int y = sqlite3_column_int(stmt, 2);
		int z = sqlite3_column_int(stmt, 3);
		int t = sqlite3_column_int(stmt, 4);

		printf("{\"x\":%d,\"y\":%d,\"z\":%d,\"t\":%d,\"points\":\n[", x, y, z, t);

		sqlite3_reset(stmt_points);
		sqlite3_bind_int64(stmt_points, 1, tileID);
		bool firstPoint = true;
		while (sqlite3_step(stmt_points) == SQLITE_ROW)
		{
			if (firstPoint) firstPoint = false;
			else printf(",\n");

			int pixelX = sqlite3_column_int(stmt_points, 0);
			int pixelY = sqlite3_column_int(stmt_points, 1);
			const char *publicationIDs = (const char*)sqlite3_column_text(stmt_points, 2);

			printf("{\"x\":%d,\"y\":%d,\"publications\":[%s]}", pixelX, pixelY, publicationIDs);
		}

		printf("]}");
	}
	printf("],");

	printf("\"stats\":[]"); // TODO

	sqlite3_finalize(stmt);
	sqlite3_finalize(stmt_points);

	printf("}");
	sqlite3_close(out_db);
}

int main(int argc, char *argv[])
{
	#ifdef _WIN32
		int64_t counterFreq, counterStart;
		QueryPerformanceFrequency(&counterFreq);
		QueryPerformanceCounter(&counterStart);
		SetConsoleOutputCP(65001);
	#else
		struct timespec counterStart;
		clock_gettime(CLOCK_MONOTONIC_RAW, &counterStart);
	#endif
	srand((unsigned int)time(NULL));

	if (argc < 2)
	{
		printf("commands:\n"
			"\tinit DB\n"
			"\textract SOURCE_DB DB\n"
			"\tprecalculate DB\n"
			"\tget DB X Y Z T\n"
			"\tdump DB\n"
		);
		return 1;
	}

	if (strcmp(argv[1], "init") == 0)
	{
		if (argc != 3) return 1;
		Init(argv[2]);
	}
	else if (strcmp(argv[1], "extract") == 0)
	{
		if (argc != 4) return 1;
		Extract(argv[2], argv[3]);
	}
	else if (strcmp(argv[1], "precalculate") == 0)
	{
		if (argc != 3) return 1;
		Precalculate(argv[2]);
	}
	else if (strcmp(argv[1], "get") == 0)
	{
		if (argc != 7) return 1;
		int x = atol(argv[3]);
		int y = atol(argv[4]);
		int z = atol(argv[5]);
		int t = atol(argv[6]);
		Get(argv[2], x, y, z, t);
	}
	else if (strcmp(argv[1], "dump") == 0)
	{
		if (argc != 3) return 1;
		Dump(argv[2]);
	}
	else
	{
		return 1;
	}

	#ifdef _WIN32
		int64_t counterEnd;
		QueryPerformanceCounter(&counterEnd);
		double dt = (double)(counterEnd - counterStart) / counterFreq;
	#else
		struct timespec counterEnd, counterDiff;
		clock_gettime(CLOCK_MONOTONIC_RAW, &counterEnd);
		timespec_diff(&counterEnd, &counterStart, &counterDiff);
		double dt = counterDiff.tv_sec + 0.000000001 * counterDiff.tv_nsec;
	#endif
	fprintf(stderr, "Time: %.3f ms\n", 1000.0 * dt);
	return 0;
}
