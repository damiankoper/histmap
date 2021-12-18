#include <assert.h>
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "data.h"
#include "sqlite3.h"
#include "system.h"

const char *const INPUT_DB_FILEPATH = "../../data/bn_geos_2.db";
const char *const OUTPUT_DB_FILEPATH = "../../data/db.json";

const char *const GEOCODE_INPUT_FILEPATH = "../../data/places.txt";
const char *const GEOCODE_RESULT_DIR = "../../data/places/";
const char *const POLYGON_RESULT_DIR = "../../data/places2/";

static void LoadGeocodedData();
static void ExtractPublications();
static void Precalculate();
static void Dump();

int main()
{
	#ifdef _WIN32
	SetConsoleOutputCP(65001);
	#endif
	srand((unsigned int)time(NULL));
	double start_time = GetTime();

	LoadGeocodedData();
	ExtractPublications();
	Precalculate();
	Dump();

	double end_time = GetTime();
	double dt = end_time - start_time;

	printf("Time: %.3f s\n", dt);
	return 0;
}

// --- PHASE 1: EXTRACTING GEOCODE RESULTS -------------------------------------

static void LoadGeocodedData()
{
	printf("Loading geocoded places...\n");

	char *geocode_input = ReadFileAlloc(GEOCODE_INPUT_FILEPATH, NULL);
	char *geocode_input_tok = strtok(geocode_input, "\n");

	int32_t input_place_id = 0;
	while (geocode_input_tok)
	{
		char filepath[100];
		sprintf(filepath, "%s%05d.json", GEOCODE_RESULT_DIR, input_place_id);

		char *geocode_result = ReadFileAlloc(filepath, NULL);

		// Try finding successful geocoding result

		char *location_string = strstr(geocode_result, "\"location\"");
		if (location_string)
		{
			float lat, lon;
			sscanf(location_string, "%*[^-0123456789]%f%*[^-0123456789]%f", &lat, &lon);
			Places_Insert(geocode_input_tok, lat, lon);

			sprintf(filepath, "%s%05d.json", POLYGON_RESULT_DIR, input_place_id);
			char *polygon_result = ReadFileAlloc(filepath, NULL);

			// Try finding successful polygon result

			char *polygon_string = strstr(polygon_result, ",\"geojson\":{\"type\":\"Polygon\",\"coordinates\":[[");
			if (polygon_string)
			{
				// TODO There is a polygon, decode
			}

			free(polygon_result);
		}

		free(geocode_result);

		geocode_input_tok = strtok(NULL, "\n");
		input_place_id += 1;
	}

	free(geocode_input);
}

// --- PHASE 2: EXTRACTING PUBLICATIONS FROM SQLITE DB -------------------------

static int64_t GetInt64(sqlite3 *db, const char *query)
{
	sqlite3_stmt *stmt;

	sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
	sqlite3_step(stmt);

	int64_t ret = sqlite3_column_int64(stmt, 0);
	sqlite3_finalize(stmt);
	return ret;
}

static void ExtractPublications()
{
	sqlite3 *db;
	sqlite3_stmt *stmt;

	sqlite3_open(INPUT_DB_FILEPATH, &db);

	printf("Counting publications...\n");
	int64_t bookCount = GetInt64(db, "SELECT COUNT(*) FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''");
	printf("There are %" PRId64 " publications with geographic names.\n", bookCount);

	sqlite3_prepare_v2(db, "SELECT TITLE, AUTHORS, PUBLICATION_PLACES, YEAR, GEOGRAPHIC_NAMES FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''", -1, &stmt, NULL);

	printf("Extracting publications and places...\n");
	while (sqlite3_step(stmt) == SQLITE_ROW)
	{
		const char *title = (const char*)sqlite3_column_text(stmt, 0);
		const char *author = (const char*)sqlite3_column_text(stmt, 1);
		const char *publication_place = (const char*)sqlite3_column_text(stmt, 2);
		int16_t year = (int16_t)sqlite3_column_int(stmt, 3);

		int32_t publication_id = Publications_Insert(title, author, publication_place, year);

		const char *geoNames = (const char*)sqlite3_column_text(stmt, 4);
		while (true)
		{
			const char *sep = strstr(geoNames, " , ");
			size_t len = sep ? (size_t)(sep - geoNames) : strlen(geoNames);

			char name[1000];
			if (len >= sizeof(name)) len = sizeof(name) - 1;
			strncpy(name, geoNames, len);
			name[len] = 0;

			int32_t place_id;
			if (Places_TryGet(name, &place_id))
			{
				PublicationPlaces_Insert(publication_id, place_id);
			}

			if (!sep) break;
			geoNames = sep + 3;
		}
	}

	sqlite3_close(db);
}

// --- PHASE 3: PRECALCULATION -------------------------------------------------

static void Precalculate()
{
	printf("There are %zu publication-place entries.\nCalculating tile points...\n", publication_places.len);

	for (size_t rowid = 0; rowid < publication_places.len; ++rowid)
	{
		PublicationPlace *pp = &publication_places.items[rowid];
		Place *pl = &places.items[pp->place_id];
		Publication *pub = &publications.items[pp->publication_id];

		for (int z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			TileCoord tc = MercatorToTileCoord(pl->pos, z);
			uint64_t tile_id = MAKE_TILE_ID(tc.tileX, tc.tileY, z, pub->year);
			TilePoints_Insert(tile_id, pp->publication_id, tc.pixelX, tc.pixelY);
		}
	}

	printf("Sorting tile points...\n");
	TilePoints_Sort();

	printf("Calculating tile stats...\n");

	bool first_tile = true;
	int32_t current_count = 0;
	uint64_t last_tile_id;
	uint16_t last_tile_point;
	for (size_t rowid = 0; rowid < tile_points.len; ++rowid)
	{
		TilePoint *tp = &tile_points.items[rowid];

		uint64_t tile_id = tp->tile_id;
		uint16_t tile_point = ((uint16_t)tp->x) | tp->y;

		if (first_tile || tile_id != last_tile_id || tile_point != last_tile_point)
		{
			if (first_tile) first_tile = false;
			else
			{
				int16_t zoom = (int16_t)(last_tile_id >> 16 & 0xFFFF);
				int16_t year = (int16_t)(last_tile_id & 0xFFFF);

				int32_t tile_stat_id = MAKE_STAT_ID(zoom, year);
				if (current_count > tile_stats[tile_stat_id]) tile_stats[tile_stat_id] = current_count;
			}

			last_tile_id = tile_id;
			last_tile_point = tile_point;
			current_count = 0;
		}

		current_count += 1;
	}
	int16_t zoom = (int16_t)(last_tile_id >> 16 & 0xFFFF);
	int16_t year = (int16_t)(last_tile_id & 0xFFFF);

	int32_t tile_stat_id = MAKE_STAT_ID(zoom, year);
	if (current_count > tile_stats[tile_stat_id]) tile_stats[tile_stat_id] = current_count;
}

// --- PHASE 4: DUMP PRECALCULATION --------------------------------------------

static void Dump()
{
	FILE *out = fopen(OUTPUT_DB_FILEPATH, "wb");

	fprintf(out, "{");

	// --- DUMPING PUBLICATIONS ---
	printf("Dumping publications...\n");

	fprintf(out, "\"publications\":[\n");

	bool firstPublication = true;
	for (size_t rowid = 0; rowid < publications.len; ++rowid)
	{
		if (firstPublication) firstPublication = false;
		else fprintf(out, ",\n");

		const Publication *pub = &publications.items[rowid];

		fprintf(out, "{\"id\":%zu,\"title\":", rowid);
		PrintJsonString(out, pub->title);
		fprintf(out, ",\"author\":");
		PrintJsonString(out, pub->author);
		fprintf(out, ",\"publicationPlace\":");
		PrintJsonString(out, pub->publication_place);
		fprintf(out, ",\"year\":%d}", pub->year);
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
	for (size_t rowid = 0; rowid < tile_points.len; ++rowid)
	{
		const TilePoint *tp = &tile_points.items[rowid];
		uint64_t tile_id = tp->tile_id;

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

		uint8_t pixel_x = tp->x;
		uint8_t pixel_y = tp->y;
		if (first_point || last_x != pixel_x || last_y != pixel_y)
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

		int32_t publication_id = tp->publication_id;
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

	fclose(out);
}
