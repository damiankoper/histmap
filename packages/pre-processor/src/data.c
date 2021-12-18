#include "data.h"

#include <stdio.h>
#include <stdlib.h>

// --- TABLE DEFINITIONS ---

Publications publications;
Places places;
PublicationPlaces publication_places;
TilePoints tile_points;
int32_t tile_stats[(MAX_ZOOM_LEVEL + 1) * 256];

// --- TABLE FUNCTION DEFINITIONS ---

#define DEFINE_ENSURE_CAPACITY(table_name, name) void name(size_t desired_capacity) { \
	if (desired_capacity < table_name.capacity) return; \
	if (table_name.capacity < 4) table_name.capacity = 4; \
	while (table_name.capacity < desired_capacity) table_name.capacity *= 2; \
	table_name.items = realloc(table_name.items, table_name.capacity * sizeof(table_name.items[0])); \
} \

DEFINE_ENSURE_CAPACITY(publications, Publications_EnsureCapacity)
DEFINE_ENSURE_CAPACITY(places, Places_EnsureCapacity)
DEFINE_ENSURE_CAPACITY(publication_places, PublicationPlaces_EnsureCapacity)
DEFINE_ENSURE_CAPACITY(tile_points, TilePoints_EnsureCapacity)

int32_t Publications_Insert(const char *title, const char *author, const char *publication_place, int16_t year)
{
	Publications_EnsureCapacity(publications.len + 1);

	int32_t rowid = (int32_t)publications.len;
	Publication *p = &publications.items[rowid];

	p->title = CloneString(title);
	p->author = CloneString(author);
	p->publication_place = CloneString(publication_place);
	p->year = year;

	publications.len += 1;
	return rowid;
}

int32_t Places_Insert(const char *name, float lat, float lon)
{
	Places_EnsureCapacity(places.len + 1);

	int32_t rowid = (int32_t)places.len;
	Place *p = &places.items[rowid];

	p->name = CloneString(name);
	p->pos = GeoCoordToMercator(lon, lat);
	p->polygon = NULL;

	places.len += 1;
	return rowid;
}

bool Places_TryGet(const char *name, int32_t *res)
{
	for (size_t rowid = 0; rowid < places.len; ++rowid)
	{
		if (strcmp(name, places.items[rowid].name) != 0) continue;

		*res = (int32_t)rowid;
		return true;
	}

	return false;
}

int32_t PublicationPlaces_Insert(int32_t publication_id, int32_t place_id)
{
	PublicationPlaces_EnsureCapacity(publication_places.len + 1);

	int32_t rowid = (int32_t)publication_places.len;
	PublicationPlace *p = &publication_places.items[rowid];

	p->publication_id = publication_id;
	p->place_id = place_id;

	publication_places.len += 1;
	return rowid;
}

int32_t TilePoints_Insert(uint64_t tile_id, int32_t publication_id, uint8_t x, uint8_t y)
{
	TilePoints_EnsureCapacity(tile_points.len + 1);

	int32_t rowid = (int32_t)tile_points.len;
	TilePoint *t = &tile_points.items[rowid];

	t->tile_id = tile_id;
	t->publication_id = publication_id;
	t->x = x;
	t->y = y;

	tile_points.len += 1;
	return rowid;
}

static int CmpTilePoints(const void *a, const void *b)
{
	const TilePoint *tpA = a;
	const TilePoint *tpB = b;

	if (tpA->tile_id < tpB->tile_id) return -1;
	if (tpA->tile_id > tpB->tile_id) return 1;
	if (tpA->y < tpB->y) return -1;
	if (tpA->y > tpB->y) return 1;
	if (tpA->x < tpB->x) return -1;
	if (tpA->y > tpB->y) return 1;
	return 0;
}

void TilePoints_Sort()
{
	qsort(tile_points.items, tile_points.len, sizeof(tile_points.items[0]), CmpTilePoints);
}

// --- INLINE FUNCTIONS ---

char *CloneString(const char *str);
Vector2 GeoCoordToMercator(float lonDeg, float latDeg);
TileCoord MercatorToTileCoord(Vector2 coords, int z);
TileCoord GeoCoordToTileCoord(float lonDeg, float latDeg, int z);
