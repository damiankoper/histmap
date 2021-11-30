#include <stdbool.h>
#include <stdint.h>

typedef struct Publications {
	int32_t count;
	int32_t capacity;

	// implicit id (by index)
	char** title;
	char** author;
	char** publication_place;
	int16_t* year;
} Publications;

typedef struct Places {
	int32_t count;
	int32_t capacity;

	// implicit id (by index)
	char** name;
	float* lat;
	float* lon;
} Places;

typedef struct PublicationPlaces {
	int32_t count;
	int32_t capacity;

	int32_t* publication_id;
	int32_t* place_id;
} PublicationPlaces;

typedef struct TilePoints {
	int32_t count;
	int32_t capacity;

	uint64_t* tile_id; // x, y, z, t
	uint8_t* x;
	uint8_t* y;
	int32_t* publication_id;
} TilePoints;

extern Publications publications;
extern Places places;
extern PublicationPlaces publicationPlaces;
extern TilePoints tilePoints;

void PublicationsEnsureCapacity(int32_t desired_capacity);
void PlacesEnsureCapacity(int32_t desired_capacity);
void PublicationPlacesEnsureCapacity(int32_t desired_capacity);
void TilePointsEnsureCapacity(int32_t desired_capacity);

int32_t PublicationInsert(const char* title, const char* author, const char* publication_place, int16_t year);
void PlaceInsert(char* name, float lat, float lon);
bool PlaceTryGet(const char* name, int32_t* res);
int32_t PlaceGetOrInsert(const char* name);
void PublicationPlaceInsert(int32_t publication_id, int32_t place_id);
void TilePointInsert(uint64_t tile_id, uint8_t x, uint8_t y, int32_t publication_id);
void TilePointGroup();

#define MAKE_TILE_ID(x, y, z, t) ((uint64_t)x << 48 | (uint64_t)y << 32 | (uint64_t)z << 16 | t)
