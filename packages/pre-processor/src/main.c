#include <assert.h>
#include <inttypes.h>
#include <immintrin.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "data.h"
#include "sqlite3.h"

#define M_PI 3.14159265358979323846
#define M_PIf 3.14159265358979323846f
#define MAX_ZOOM_LEVEL 8
#define TILE_PIXEL_SIZE 256

const char* const INPUT_DB_FILEPATH = "../../data/bn_geos_2.db";
const char* const OUTPUT_DB_FILEPATH = "../../data/db.json";

const char* const GEOCODE_INPUT_FILEPATH = "../../data/places.txt";
const char* const GEOCODE_RESULT_DIR = "../../data/places/";

static int32_t tile_stats[MAX_ZOOM_LEVEL * 256];
static char geocode_json_buffer[24576];

#ifdef _WIN32
int __stdcall SetConsoleOutputCP(unsigned int wCodePageID);
int QueryPerformanceFrequency(int64_t* lpFrequency);
int QueryPerformanceCounter(int64_t* lpPerformanceCount);
#endif

typedef struct TileCoord {
	int16_t tileX;
	int16_t tileY;
	uint8_t pixelX;
	uint8_t pixelY;
} TileCoord;

static TileCoord GeoCoordToTileCoord(float lonDeg, float latDeg, int z)
{
	float x = (lonDeg + 180.0f) / 360.0f * (1 << z);
	float latRad = latDeg * M_PIf / 180.0f;
	float y = (1.0f - asinhf(tanf(latRad)) / M_PIf) / 2.0f * (1 << z);

	return (TileCoord){
		.tileX = (int16_t)floorf(x),
		.tileY = (int16_t)floorf(y),
		.pixelX = (uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(x, 1.0f) + 1.0f, 1.0f)),
		.pixelY = (uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(y, 1.0f) + 1.0f, 1.0f)),
	};
}

static char* ReadFileAlloc(const char* filename)
{
	FILE* file = fopen(filename, "rb");

	fseek(file, 0L, SEEK_END);
	size_t length = (size_t)ftell(file);
	rewind(file);

	char* buf = malloc(length + 1);
	fread(buf, 1, length, file);
	buf[length] = '\0';

	fclose(file);
	return buf;
}

#ifndef _WIN32
static void timespec_diff(struct timespec* a, struct timespec* b, struct timespec* result)
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

static void Extract(const char* intputDbFilename)
{
	sqlite3* db;
	sqlite3_stmt* stmt;

	sqlite3_open(intputDbFilename, &db);

	printf("Counting publications...\n");
	int64_t bookCount = GetInt64(db, "SELECT COUNT(*) FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''");
	printf("There are %" PRId64 " publications with geographic names.\n", bookCount);

	sqlite3_prepare_v2(db, "SELECT TITLE, AUTHORS, YEAR, GEOGRAPHIC_NAMES FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''", -1, &stmt, NULL);

	printf("Extracting publications and places...\n");
	while (sqlite3_step(stmt) == SQLITE_ROW)
	{
		const char* title = (const char*)sqlite3_column_text(stmt, 0);
		const char* author = (const char*)sqlite3_column_text(stmt, 1);
		int16_t year = (int16_t)sqlite3_column_int(stmt, 2);

		int32_t publication_id = PublicationInsert(title, author, year);

		const char* geoNames = (const char*)sqlite3_column_text(stmt, 3);
		while (true)
		{
			const char* sep = strstr(geoNames, " , ");
			size_t len = sep ? (size_t)(sep - geoNames) : strlen(geoNames);

			char name[1000];
			if (len >= sizeof(name)) len = sizeof(name) - 1;
			strncpy(name, geoNames, len);
			name[len] = 0;

			int32_t place_id;
			if (PlaceTryGet(name, &place_id))
			{
				PublicationPlaceInsert(publication_id, place_id);
			}

			if (!sep) break;
			geoNames = sep + 3;
		}
	}

	sqlite3_close(db);
}

static void LoadGeocodedData()
{
	printf("Loading geocoded data...\n");

	char* places_file_content = ReadFileAlloc(GEOCODE_INPUT_FILEPATH);

	FILE* file;

	char* tok = strtok(places_file_content, "\n");
	int place_input_id = 0;
	while (tok)
	{
		char geocode_result_filepath[100];
		sprintf(geocode_result_filepath, "%s%05d.json", GEOCODE_RESULT_DIR, place_input_id);

		file = fopen(geocode_result_filepath, "rb");
		size_t len = fread(geocode_json_buffer, 1, sizeof(geocode_json_buffer), file);
		geocode_json_buffer[len] = '\0';

		char* loc = strstr(geocode_json_buffer, "\"location\"");
		if (loc)
		{
			float lat, lon;
			sscanf(loc, "%*[^-0123456789]%f%*[^-0123456789]%f", &lat, &lon);
			PlaceInsert(tok, lat, lon);
		}

		fclose(file);

		tok = strtok(NULL, "\n");
		place_input_id += 1;
	}
}

static void Precalculate()
{
	printf("There are %" PRId32 " publication-place entries.\nCalculating tile points...\n", publicationPlaces.count);

	for (int32_t rowid = 0; rowid < publicationPlaces.count; ++rowid)
	{
		int32_t publication_id = publicationPlaces.publication_id[rowid];
		int32_t place_id = publicationPlaces.place_id[rowid];
		float lat = places.lat[place_id];
		float lon = places.lon[place_id];
		int16_t t = publications.year[publication_id];

		for (int z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			TileCoord tc = GeoCoordToTileCoord(lon, lat, z);
			uint64_t tile_id = MAKE_TILE_ID(tc.tileX, tc.tileY, z, t);
			TilePointInsert(tile_id, (uint8_t)tc.pixelX, (uint8_t)tc.pixelY, publication_id);
		}
	}

	printf("Grouping tile points...\n");
	TilePointGroup();

	printf("Calculating tile stats...\n");

	bool first_tile = true;
	int32_t current_count = 0;
	uint64_t last_tile_id;
	for (int32_t rowid = 0; rowid < tilePoints.count; ++rowid)
	{
		uint64_t tile_id = tilePoints.tile_id[rowid];

		if (first_tile || tile_id != last_tile_id)
		{
			if (first_tile) first_tile = false;
			else
			{
				int16_t zoom = (int16_t)(last_tile_id >> 16 & 0xFFFF);
				int16_t year = (int16_t)(last_tile_id & 0xFFFF);

				int32_t tile_stat_id = zoom * 256 + (year - 1800);
				if (current_count > tile_stats[tile_stat_id]) tile_stats[tile_stat_id] = current_count;
			}

			last_tile_id = tile_id;
			current_count = 0;
		}

		current_count += 1;
	}
	int16_t zoom = (int16_t)(last_tile_id >> 16 & 0xFFFF);
	int16_t year = (int16_t)(last_tile_id & 0xFFFF);

	int32_t tile_stat_id = zoom * 256 + (year - 1800);
	if (current_count > tile_stats[tile_stat_id]) tile_stats[tile_stat_id] = current_count;
}

static void PrintJsonString(FILE* out, const char* str)
{
	fprintf(out, "\"");
	while (*str)
	{
		char c = *str;

		if (c == '\\' || c == '"' || (c >= 0x00 && c <= 0x1F))
		{
			fprintf(out, "\\u%04X", c);
		}
		else
		{
			fwrite(&c, 1, 1, out);
		}

		str += 1;
	}
	fprintf(out, "\"");
}

static void Dump(FILE* out)
{
	fprintf(out, "{");

	// --- DUMPING PUBLICATIONS ---
	printf("Dumping publications...\n");

	fprintf(out, "\"publications\":[\n");

	bool firstPublication = true;
	for (int32_t rowid = 0; rowid < publications.count; ++rowid)
	{
		if (firstPublication) firstPublication = false;
		else fprintf(out, ",\n");

		const char* title = publications.title[rowid];
		const char* author = publications.author[rowid];
		int16_t year = publications.year[rowid];

		fprintf(out, "{\"id\":%" PRId32 ",\"title\":", rowid);
		PrintJsonString(out, title);
		fprintf(out, ",\"author\":");
		PrintJsonString(out, author);
		fprintf(out, ",\"places\":[],\"year\":%d}", year); // TODO Places for debug data.
	}

	fprintf(out, "],\n");

	// --- DUMPING TILES ---
	printf("Dumping tiles...\n");

	fprintf(out, "\"preTiles\":[\n");

	bool first_tile = true;
	bool first_point = true;
	bool first_publication = true;
	uint64_t last_tile_id;
	uint8_t last_x, last_y;
	for (int32_t rowid = 0; rowid < tilePoints.count; ++rowid)
	{
		uint64_t tile_id = tilePoints.tile_id[rowid];

		if (first_tile || tile_id != last_tile_id)
		{
			if (first_tile) first_tile = false;
			else fprintf(out, "]}]},\n");

			int16_t tile_x = (int16_t)(tile_id >> 48 & 0xFFFF);
			int16_t tile_y = (int16_t)(tile_id >> 32 & 0xFFFF);
			int16_t tile_z = (int16_t)(tile_id >> 16 & 0xFFFF);
			int16_t tile_t = (int16_t)(tile_id & 0xFFFF);
			fprintf(out, "{\"x\":%d,\"y\":%d,\"z\":%d,\"t\":%d,\"points\":[\n", tile_x, tile_y, tile_z, tile_t);

			last_tile_id = tile_id;
			first_point = true;
		}

		uint8_t pixel_x = tilePoints.x[rowid];
		uint8_t pixel_y = tilePoints.y[rowid];
		if (first_point || (last_x != pixel_x && last_y != pixel_y))
		{
			if (first_point) first_point = false;
			else fprintf(out, "]},\n");

			fprintf(out, " {\"x\":%d,\"y\":%d,\"publications\":[", pixel_x, pixel_y);

			last_x = pixel_x;
			last_y = pixel_y;
			first_publication = true;
		}

		if (first_publication) first_publication = false;
		else fprintf(out, ",");

		int32_t publication_id = tilePoints.publication_id[rowid];
		fprintf(out, "%d", publication_id);
	}
	fprintf(out, "]}]}],\n");

	// --- DUMPING STATS ---
	printf("Dumping stats...\n");

	fprintf(out, "\"stats\":[\n");

	bool first_stat = true;
	for (size_t stat_id = 0; stat_id < sizeof(tile_stats) / sizeof(*tile_stats); ++stat_id)
	{
		int32_t max = tile_stats[stat_id];
		if (max <= 0) continue;

		if (first_stat) first_stat = false;
		else fprintf(out, ",\n");

		int16_t tile_z = (int16_t)(stat_id / 256);
		int16_t tile_t = stat_id % 256 + 1800;

		fprintf(out, "{\"z\":%d,\"t\":%d,\"max\":%d}", tile_z, tile_t, max);
	}
	fprintf(out, "]");

	fprintf(out, "}");
}

void DumpPlaces(FILE* out)
{
	printf("Dumping places...\n");

	for (int32_t rowid = 0; rowid < places.count; ++rowid)
	{
		fprintf(out, "%s\n", places.name[rowid]);
	}
}

int main()
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

	LoadGeocodedData();
	Extract(INPUT_DB_FILEPATH);
	Precalculate();
	FILE* fout = fopen(OUTPUT_DB_FILEPATH, "wb");
	Dump(fout);
	fclose(fout);
	//FILE* fplaces = fopen("places.txt", "wb");
	//DumpPlaces(fplaces);
	//fclose(fplaces);

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
	printf("Time: %.3f ms\n", 1000.0 * dt);
	return 0;
}
