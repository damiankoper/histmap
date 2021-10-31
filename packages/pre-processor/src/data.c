#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "data.h"

Publications publications;
Places places;
PublicationPlaces publicationPlaces;
TilePoints tilePoints;

static float RandFloat() { return (float)rand() / (RAND_MAX + 1.0f); }
static float RandFloatRange(float a, float b) { return a + RandFloat() * (b - a); }

#define EC_H(tbl) do { \
	if (desired_capacity < tbl.capacity) return; \
	if (tbl.capacity < 4) tbl.capacity = 4; \
	while (tbl.capacity < desired_capacity) tbl.capacity *= 2; \
} while (0)
#define EC_I(tbl, col) tbl.col = realloc(tbl.col, tbl.capacity * sizeof(tbl.col[0]))

void PublicationsEnsureCapacity(int32_t desired_capacity)
{
	EC_H(publications);
	EC_I(publications, title);
	EC_I(publications, author);
	EC_I(publications, year);
}

void PlacesEnsureCapacity(int32_t desired_capacity)
{
	EC_H(places);
	EC_I(places, name);
	EC_I(places, lat);
	EC_I(places, lon);
}

void PublicationPlacesEnsureCapacity(int32_t desired_capacity)
{
	EC_H(publicationPlaces);
	EC_I(publicationPlaces, publication_id);
	EC_I(publicationPlaces, place_id);
}

void TilePointsEnsureCapacity(int32_t desired_capacity)
{
	EC_H(tilePoints);
	EC_I(tilePoints, tile_id);
	EC_I(tilePoints, x);
	EC_I(tilePoints, y);
	EC_I(tilePoints, publication_id);
}

#undef EC_H
#undef EC_I

int32_t PublicationInsert(const char* title, const char* author, int16_t year)
{
	PublicationsEnsureCapacity(publications.count + 1);

	size_t title_len = strlen(title);
	size_t author_len = strlen(author);

	char* title_copy = malloc(title_len + 1);
	char* author_copy = malloc(author_len + 1);

	strcpy(title_copy, title);
	strcpy(author_copy, author);

	publications.title[publications.count] = title_copy;
	publications.author[publications.count] = author_copy;
	publications.year[publications.count] = year;

	return publications.count++;
}

int32_t PlaceGetOrInsert(const char* name)
{
	for (int32_t rowid = 0; rowid < places.count; ++rowid)
	{
		if (strcmp(name, places.name[rowid]) == 0) return rowid;
	}

	PlacesEnsureCapacity(places.count + 1);

	size_t name_len = strlen(name);
	char* name_copy = malloc(name_len + 1);
	strcpy(name_copy, name);

	places.name[places.count] = name_copy;
	places.lat[places.count] = RandFloatRange(-85.0f, 85.0f);
	places.lon[places.count] = RandFloatRange(-179.95f, 179.95f);

	return places.count++;
}

void PublicationPlaceInsert(int32_t publication_id, int32_t place_id)
{
	PublicationPlacesEnsureCapacity(publicationPlaces.count + 1);

	publicationPlaces.publication_id[publicationPlaces.count] = publication_id;
	publicationPlaces.place_id[publicationPlaces.count] = place_id;

	publicationPlaces.count++;
}

void TilePointInsert(uint64_t tile_id, uint8_t x, uint8_t y, int32_t publication_id)
{
	TilePointsEnsureCapacity(tilePoints.count + 1);

	tilePoints.tile_id[tilePoints.count] = tile_id;
	tilePoints.x[tilePoints.count] = x;
	tilePoints.y[tilePoints.count] = y;
	tilePoints.publication_id[tilePoints.count] = publication_id;

	tilePoints.count++;
}

static int CmpTilePoints(uint64_t a_id, uint8_t a_x, uint8_t a_y, uint64_t b_id, uint8_t b_x, uint8_t b_y)
{
	if (a_id < b_id) return -1;
	if (a_id > b_id) return 1;
	if (a_y < b_y) return -1;
	if (a_y > b_y) return 1;
	if (a_x < b_x) return -1;
	if (a_x > b_x) return 1;
	return 0;
}

static void SwapTilePoints(int32_t i, int32_t j)
{
	uint64_t tmp_tile_id = tilePoints.tile_id[i];
	tilePoints.tile_id[i] = tilePoints.tile_id[j];
	tilePoints.tile_id[j] = tmp_tile_id;

	uint8_t tmp_x = tilePoints.x[i];
	tilePoints.x[i] = tilePoints.x[j];
	tilePoints.x[j] = tmp_x;

	uint8_t tmp_y = tilePoints.y[i];
	tilePoints.y[i] = tilePoints.y[j];
	tilePoints.y[j] = tmp_y;

	int32_t tmp_publication_id = tilePoints.publication_id[i];
	tilePoints.publication_id[i] = tilePoints.publication_id[j];
	tilePoints.publication_id[j] = tmp_publication_id;
}

static void SortTilePoints(int32_t a, int32_t b)
{
	if (b - a < 2) return;

	uint64_t* tile_id = tilePoints.tile_id;
	uint8_t* x = tilePoints.x;
	uint8_t* y = tilePoints.y;
	int32_t* publication_id = tilePoints.publication_id;

	int32_t pivot_rowid = a;

	uint64_t pivot_tile_id = tile_id[pivot_rowid];
	uint8_t pivot_x = x[pivot_rowid];
	uint8_t pivot_y = y[pivot_rowid];

	int32_t i = a;
	int32_t j = b - 1;
	while(i < j)
	{
		while (CmpTilePoints(tile_id[i], x[i], y[i], pivot_tile_id, pivot_x, pivot_y) <= 0 && i < b - 1) i += 1;
		while (CmpTilePoints(tile_id[j], x[j], y[j], pivot_tile_id, pivot_x, pivot_y) > 0) j -= 1;

		if (i >= j) continue;

		SwapTilePoints(i, j);
	}

	SwapTilePoints(j, pivot_rowid);

	SortTilePoints(a, j);
	SortTilePoints(j + 1, b);
}

void TilePointGroup()
{
	SortTilePoints(0, tilePoints.count);
}
