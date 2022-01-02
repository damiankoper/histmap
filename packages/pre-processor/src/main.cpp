#include <cassert>
#include <cinttypes>
#include <ctime>

#include "data.h"
#include "sqlite3.h"
#include "system.h"

const char *const INPUT_DB_FILEPATH = "../../data/bn_geos_2.db";
const char *const OUTPUT_DB_FILEPATH = "../../data/data.json";

const char *const GEOCODE_INPUT_FILEPATH = "../../data/places.txt";
const char *const GEOCODE_RESULT_FILE = "../../data/places.bin";
const char *const POLYGON_RESULT_DIR = "../../data/places2/";

const char GEOJSON_MATCH_STRING[] = ",\"geojson\":{\"type\":\"Polygon\",\"coordinates\":[[";

#define EXPANSION_PIXEL_HSPACING 30
#define EXPANSION_PIXEL_VSPACING 26

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
	gData.MakePlaceNameIndex();
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
	printf("Loading geocoded places... %5d", 0);

	std::string geocode_input = ReadFile(GEOCODE_INPUT_FILEPATH, NULL);
	char *geocode_input_tok = strtok(geocode_input.data(), "\n");

	std::string geocode_result = ReadFile(GEOCODE_RESULT_FILE, NULL);

	int32_t polygon_count = 0;

	int32_t input_place_id = 0;
	while (geocode_input_tok)
	{
		printf("\rLoading geocoded places... %5d", input_place_id + 1);

		// Try finding successful geocoding result

		float lat, lon;
		memcpy(&lat, &geocode_result[(size_t)input_place_id * 8], 4);
		memcpy(&lon, &geocode_result[(size_t)input_place_id * 8 + 4], 4);

		if (!isnan(lat) && !isnan(lon))
		{
			Place_ID place_id(input_place_id);

			gData.places.Insert(Place(
				place_id,
				std::string(geocode_input_tok),
				GeoCoordToMercator(lon, lat)
			));

			char filepath[100];
			sprintf(filepath, "%s%05d.json", POLYGON_RESULT_DIR, input_place_id);
			std::string polygon_result = ReadFile(filepath, NULL);

			// Try finding successful polygon result

			char *polygon_string = strstr(polygon_result.data(), GEOJSON_MATCH_STRING);
			if (polygon_string)
			{
				polygon_string += sizeof(GEOJSON_MATCH_STRING);

				Polygon polygon(place_id);
				std::vector<Vector2>& points = polygon.points;

				char* str = polygon_string;
				while (true)
				{
					lon = strtof(str, &str);
					str += 1; // skip comma
					lat = strtof(str, &str);
					str += 1; // skip closing bracket

					Vector2 point = GeoCoordToMercator(lon, lat);
					points.push_back(point);

					if (str[0] == ']') break;
					str += 2; // skip ",["
				}

				polygon_count += 1;
				gData.polygons.Insert(std::move(polygon));
			}
		}

		geocode_input_tok = strtok(NULL, "\n");
		input_place_id += 1;
	}
	printf("\nThere are %d places with defined polygon.\n", polygon_count);

	// --- EXPANDING POLYGONS ---

	for (Polygon& polygon : gData.polygons.table)
	{
		const std::vector<Vector2>& points = polygon.points;

		Vector2 min(INFINITY, INFINITY);
		Vector2 max(-INFINITY, -INFINITY);

		for (const Vector2& point : points)
		{
			if (point.x < min.x) min.x = point.x;
			if (point.y < min.y) min.y = point.y;
			if (point.x > max.x) max.x = point.x;
			if (point.y > max.y) max.y = point.y;
		}

		for (int16_t z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			printf("\rExpanding polygons... %d, z = %" PRIi16, polygon.id.id, z);

			std::vector<Vector2>& expansion = polygon.expansions[z];

			float pixelsPerUnit = (float)(1 << z) * (float)TILE_PIXEL_SIZE;

			float dx = EXPANSION_PIXEL_HSPACING / pixelsPerUnit;
			float dy = EXPANSION_PIXEL_VSPACING / pixelsPerUnit;

			bool halfOffset = false;

			for (float y = min.y; y <= max.y; y += dy)
			{
				float offset = halfOffset ? -0.5f * dx : 0.0f;
				for (float x = min.x + offset; x <= max.x; x += dx)
				{
					Vector2 p = Vector2(x, y);
					if (!PointInPolygon(p, points)) continue;

					expansion.push_back(p);
				}
				halfOffset = !halfOffset;
			}

			if (expansion.size() == 0)
			{
				Place *place = gData.places.Get(polygon.id);
				expansion.push_back(place->mercatorPoint);
			}
			else if (expansion.size() == 1)
			{
				Place *place = gData.places.Get(polygon.id);
				expansion[0] = place->mercatorPoint;
			}
		}
	}

	printf("\n");
}

// --- PHASE 2: EXTRACTING PUBLICATIONS FROM SQLITE DB -------------------------

static void ExtractPublications()
{
	sqlite3 *db;
	sqlite3_stmt *stmt;

	sqlite3_open(INPUT_DB_FILEPATH, &db);

	sqlite3_prepare_v2(db, "SELECT TITLE, AUTHORS, PUBLICATION_PLACES, YEAR, GEOGRAPHIC_NAMES FROM BOOKS WHERE GEOGRAPHIC_NAMES != ''", -1, &stmt, NULL);

	int32_t publication_id = 0;

	printf("Extracting publications and places...\n");
	while (sqlite3_step(stmt) == SQLITE_ROW)
	{
		Publication_ID id(publication_id);
		const char *title = (const char*)sqlite3_column_text(stmt, 0);
		const char *author = (const char*)sqlite3_column_text(stmt, 1);
		const char *publicationPlace = (const char*)sqlite3_column_text(stmt, 2);
		int16_t year = (int16_t)sqlite3_column_int(stmt, 3);

		std::vector<Place_ID> places;

		const char *geoNames = (const char*)sqlite3_column_text(stmt, 4);
		while (true)
		{
			const char *sep = strstr(geoNames, " , ");
			size_t len = sep ? (size_t)(sep - geoNames) : strlen(geoNames);

			std::string name(geoNames, len);

			Place* place;
			if (gData.TryGetPlaceByName(name, place))
			{
				places.push_back(place->id);
			}

			if (!sep) break;
			geoNames = sep + 3;
		}

		gData.publications.Insert(Publication(
			id,
			std::string(title),
			std::string(author),
			std::string(publicationPlace),
			year,
			std::move(places)
		));

		publication_id += 1;
	}

	sqlite3_close(db);
}

// --- PHASE 3: PRECALCULATION -------------------------------------------------

static void Precalculate()
{
	printf("Calculating areas...\n");

	for (const Publication& publication : gData.publications.table)
	{
		for (const Place_ID& place_id : publication.places)
		{
			Polygon *polygon;
			if (!gData.polygons.TryGet(place_id, polygon)) continue;

			Area_ID area_id(place_id, publication.year);
			Area_ID area_id_t0(place_id, 0);

			Area *area;
			if (gData.areas.TryGet(area_id, area))
			{
				area->publications.push_back(publication.id);
			}
			else
			{
				gData.areas.Insert(Area(area_id, publication.id));
			}

			if (gData.areas.TryGet(area_id_t0, area))
			{
				area->publications.push_back(publication.id);
			}
			else
			{
				gData.areas.Insert(Area(area_id_t0, publication.id));
			}
		}
	}

	printf("Calculating tile points...\n");

	for (const Publication& publication : gData.publications.table)
	{
		for (const Place_ID& place_id : publication.places)
		{
			Area_ID area_id(place_id, publication.year);
			Area *area = nullptr;
			Polygon *polygon = nullptr;
			if (gData.areas.TryGet(area_id, area))
			{
				polygon = gData.polygons.Get(place_id);
			}

			for (int16_t z = 0; z <= MAX_ZOOM_LEVEL; ++z)
			{
				if (polygon && polygon->expansions[z].size() > 1) continue;

				Place *place = gData.places.Get(place_id);
				TileCoord tc = MercatorToTileCoord(place->mercatorPoint, z);

				PreTile_ID preTile_id = PreTile_ID(tc.tileX, tc.tileY, z, publication.year);
				Point_ID point_id = Point_ID(tc.pixelX, tc.pixelY);
				PreTile_ID preTile_id_t0 = PreTile_ID(tc.tileX, tc.tileY, z, 0);

				PreTile *preTile;
				Point *point;

				if (!gData.preTiles.TryGet(preTile_id, preTile))
				{
					gData.preTiles.Insert(PreTile(preTile_id));
					preTile = gData.preTiles.Get(preTile_id);
				}
				if (!preTile->points.TryGet(point_id, point))
				{
					preTile->points.Insert(Point(point_id));
					point = preTile->points.Get(point_id);
				}
				point->publications.push_back(publication.id);

				if (!gData.preTiles.TryGet(preTile_id_t0, preTile))
				{
					gData.preTiles.Insert(PreTile(preTile_id_t0));
					preTile = gData.preTiles.Get(preTile_id_t0);
				}

				if (!preTile->points.TryGet(point_id, point))
				{
					preTile->points.Insert(Point(point_id));
					point = preTile->points.Get(point_id);
				}
				point->publications.push_back(publication.id);
			}
		}
	}

	printf("Calculating area points...\n");

	for (const Area& area : gData.areas.table)
	{
		Polygon *polygon = gData.polygons.Get(area.id.id);

		for (int16_t z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			const std::vector<Vector2>& expansion = polygon->expansions[z];

			if (expansion.size() <= 1) continue;

			for (Vector2 point : expansion)
			{
				TileCoord tc = MercatorToTileCoord(point, z);

				PreTile_ID preTile_id = PreTile_ID(tc.tileX, tc.tileY, z, area.id.t);
				PreTile *preTile;
				if (!gData.preTiles.TryGet(preTile_id, preTile))
				{
					gData.preTiles.Insert(PreTile(preTile_id));
					preTile = gData.preTiles.Get(preTile_id);
				}

				Point_ID point_id = Point_ID(tc.pixelX, tc.pixelY);

				Point *preTilePoint;
				if (!preTile->points.TryGet(point_id, preTilePoint))
				{
					preTile->points.Insert(Point(point_id));
					preTilePoint = preTile->points.Get(point_id);
				}

				preTilePoint->areas.push_back(area.id.id);
			}
		}
	}

	printf("Calculating tile stats...\n");

	for (const PreTile& preTile : gData.preTiles.table)
	{
		TileStat_ID tileStat_id(preTile.id.t, preTile.id.z);
		TileStat *tileStat;
		if (!gData.tileStats.TryGet(tileStat_id, tileStat))
		{
			gData.tileStats.Insert(TileStat(tileStat_id));
			tileStat = gData.tileStats.Get(tileStat_id);
		}

		for (const Point& point : preTile.points.table)
		{
			double value = (double)point.publications.size();
			for (const Place_ID& place_id : point.areas)
			{
				Area_ID area_id(place_id, preTile.id.t);
				Area *area = gData.areas.Get(area_id);

				Polygon *polygon = gData.polygons.Get(area_id.id);
				size_t expansion_len = polygon->expansions[preTile.id.z].size();

				assert(expansion_len > 1);
				
				value += (double)area->publications.size() / expansion_len;
			}

			if (value > tileStat->max) tileStat->max = value;
		}
	}

	printf("Calculating area stats...\n");

	for (const Polygon& polygon : gData.polygons.table)
	{
		for (int16_t z = 0; z <= MAX_ZOOM_LEVEL; ++z)
		{
			size_t expansion_len = polygon.expansions[z].size();

			if (expansion_len <= 1) continue;

			AreaStat_ID areaStat_id(polygon.id, z);

			gData.areaStats.Insert(AreaStat(areaStat_id, (int32_t)expansion_len));
		}
	}
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
	for (const Publication& publication : gData.publications.table)
	{
		if (firstPublication) firstPublication = false;
		else fprintf(out, ",\n");

		fprintf(out, "{\"id\":%" PRId32 ",\"title\":", publication.id.id);
		PrintJsonString(out, publication.title.c_str());
		fprintf(out, ",\"author\":");
		PrintJsonString(out, publication.author.c_str());
		fprintf(out, ",\"publicationPlace\":");
		PrintJsonString(out, publication.publicationPlace.c_str());
		fprintf(out, ",\"year\":%" PRId16 "}", publication.year);
	}

	fprintf(out, "],\n");

	// --- DUMPING AREAS ---
	printf("Dumping areas...\n");

	fprintf(out, "\"areas\":[\n");

	bool firstArea = true;
	for (const Area& area : gData.areas.table)
	{
		if (firstArea) firstArea = false;
		else fprintf(out, ",\n");

		fprintf(out, "{\"id\":%" PRId32 ",\"t\":%" PRId16 ",\"publications\":[", area.id.id.id, area.id.t);

		firstPublication = true;
		for (const Publication_ID& publication_id : area.publications)
		{
			if (firstPublication) firstPublication = false;
			else fputc(',', out);

			fprintf(out, "%" PRId32, publication_id.id);
		}

		fprintf(out, "]}");
	}

	fprintf(out, "],\n");

	// --- DUMPING AREA STATS ---
	printf("Dumping area stats...\n");

	fprintf(out, "\"areaStats\":[");

	bool firstAreaStat = true;
	for (const AreaStat& areaStat : gData.areaStats.table)
	{
		if (areaStat.pointCount < 1) continue;

		if (firstAreaStat) firstAreaStat = false;
		else fprintf(out, ",\n");

		fprintf(out, "{\"id\":%" PRId32 ",\"z\":%" PRId16 ",\"pointCount\":%" PRId32 "}", areaStat.id.id.id, areaStat.id.z, areaStat.pointCount);
	}

	fprintf(out, "],\n");

	// --- DUMPING PRETILES ---
	printf("Dumping pretiles...\n");

	fprintf(out, "\"preTiles\":[\n");

	bool firstPreTile = true;
	for (const PreTile& preTile : gData.preTiles.table)
	{
		if (firstPreTile) firstPreTile = false;
		else fprintf(out, ",\n");

		fprintf(out, "{\"x\":%" PRId16 ",\"y\":%" PRId16 ",\"z\":%" PRId16 ",\"t\":%" PRId16 ",\"points\":[", preTile.id.x, preTile.id.y, preTile.id.z, preTile.id.t);

		bool firstPoint = true;
		for (const Point& point : preTile.points.table)
		{
			if (firstPoint) firstPoint = false;
			else fprintf(out, ",\n");

			fprintf(out, "{\"x\":%" PRIu8 ",\"y\":%" PRIu8 ",\"areas\":[", point.id.x, point.id.y);

			firstArea = true;
			for (const Place_ID& place_id : point.areas)
			{
				if (firstArea) firstArea = false;
				else fputc(',', out);

				fprintf(out, "%" PRId32, place_id.id);
			}

			fprintf(out, "],\"publications\":[");

			firstPublication = true;
			for (const Publication_ID& publication_id : point.publications)
			{
				if (firstPublication) firstPublication = false;
				else fputc(',', out);

				fprintf(out, "%" PRId32, publication_id.id);
			}

			fprintf(out, "]}");
		}

		fprintf(out, "]}");
	}
	
	fprintf(out, "],\n");

	// --- DUMPING STATS ---
	printf("Dumping stats...\n");

	fprintf(out, "\"stats\":[\n");

	bool firstTileStat = true;
	for (const TileStat& tileStat : gData.tileStats.table)
	{
		if (firstTileStat) firstTileStat = false;
		else fprintf(out, ",\n");

		fprintf(out, "{\"t\":%" PRId16 ",\"z\":%" PRId16 ",\"max\":%f}", tileStat.id.t, tileStat.id.z, tileStat.max);
	}
	fprintf(out, "]");

	// --- END OF DUMP ---

	fprintf(out, "}");

	fclose(out);
}
