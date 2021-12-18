#pragma once

#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define M_PI 3.14159265358979323846
#define M_PIf 3.14159265358979323846f

#define TILE_PIXEL_SIZE 256
#define MAX_ZOOM_LEVEL 13

// --- COMMON TYPES ---

typedef struct Vector2 {
	float x;
	float y;
} Vector2;

typedef struct TileCoord {
	int16_t tileX;
	int16_t tileY;
	uint8_t pixelX;
	uint8_t pixelY;
} TileCoord;

// --- TABLE TYPES ---

typedef struct Polygon {
	size_t len;
	Vector2 points[];
} Polygon;

typedef struct Publication {
	char *title;
	char *author;
	char *publication_place;
	int16_t year;
} Publication;

typedef struct Place {
	char *name;
	Vector2 pos;
	Polygon *polygon; // optional
} Place;

typedef struct PublicationPlace {
	int32_t publication_id;
	int32_t place_id;
} PublicationPlace;

typedef struct TilePoint {
	uint64_t tile_id; // x, y, z, t
	int32_t publication_id;
	uint8_t x;
	uint8_t y;
} TilePoint;

// --- TABLE DECLARATIONS ---

#define DECLARE_TABLE(typename, inner_type, name) typedef struct typename { inner_type *items; size_t len; size_t capacity; } typename; extern typename name;

DECLARE_TABLE(Publications, Publication, publications)
DECLARE_TABLE(Places, Place, places)
DECLARE_TABLE(PublicationPlaces, PublicationPlace, publication_places)
DECLARE_TABLE(TilePoints, TilePoint, tile_points)
extern int32_t tile_stats[(MAX_ZOOM_LEVEL + 1) * 256];

// --- TABLE FUNCTION DECLARATIONS ---

void Publications_EnsureCapacity(size_t desired_capacity);
int32_t Publications_Insert(const char *title, const char* author, const char* publication_place, int16_t year);

void Places_EnsureCapacity(size_t desired_capacity);
int32_t Places_Insert(const char *name, float lat, float lon);
bool Places_TryGet(const char *name, int32_t *res);

void PublicationPlaces_EnsureCapacity(size_t desired_capacity);
int32_t PublicationPlaces_Insert(int32_t publication_id, int32_t place_id);

void TilePoints_EnsureCapacity(size_t desired_capacity);
int32_t TilePoints_Insert(uint64_t tile_id, int32_t publication_id, uint8_t x, uint8_t y);
void TilePoints_Sort();

// --- INLINE FUNCTIONS/MACROS ---

#define MAKE_TILE_ID(x, y, z, t) ((uint64_t)x << 48 | (uint64_t)y << 32 | (uint64_t)z << 16 | t)
#define MAKE_STAT_ID(z, t) ((uint16_t)z << 8 | (uint16_t)(year - 1800))

inline char *CloneString(const char *str)
{
	size_t length = strlen(str);

	char *buf = malloc(length + 1);
	memcpy(buf, str, length + 1); // copying with null terminator

	return buf;
}

inline Vector2 GeoCoordToMercator(float lonDeg, float latDeg)
{
	float x = (lonDeg + 180.0f) / 360.0f;
	float latRad = latDeg * M_PIf / 180.0f;
	float y = (1.0f - asinhf(tanf(latRad)) / M_PIf) / 2.0f;

	return (Vector2){.x = x, .y = y};
}

inline TileCoord MercatorToTileCoord(Vector2 coords, int z)
{
	coords.x *= 1 << z;
	coords.y *= 1 << z;
	return (TileCoord){
		.tileX = (int16_t)floorf(coords.x),
		.tileY = (int16_t)floorf(coords.y),
		.pixelX = (uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(coords.x, 1.0f) + 1.0f, 1.0f)),
		.pixelY = (uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(coords.y, 1.0f) + 1.0f, 1.0f)),
	};
}

inline TileCoord GeoCoordToTileCoord(float lonDeg, float latDeg, int z)
{
	return MercatorToTileCoord(GeoCoordToMercator(lonDeg, latDeg), z);
}
