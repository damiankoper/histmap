#pragma once

#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <immintrin.h>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#define M_PI 3.14159265358979323846
#define M_PIf 3.14159265358979323846f

#define TILE_PIXEL_SIZE 256
#define MAX_ZOOM_LEVEL 13
#define MAX_EXPANSION_LEVEL 13

// --- COMMON TYPES ---

union Any32 {
	float f32;
	uint32_t u32;
};

struct Vector2 {
	float x, y;
	Vector2() = default;
	constexpr Vector2(float x, float y) : x(x), y(y) {}
};

struct TileCoord {
	int16_t tileX;
	int16_t tileY;
	uint8_t pixelX;
	uint8_t pixelY;
};

// --- TABLE IMPLEMENTATION ---

template <typename T, typename KeyT = typename T::KeyT>
struct Table {
	std::unordered_map<KeyT, size_t> index;
	std::vector<T> table;

	T* Get(KeyT key)
	{
		assert(index.count(key) == 1);

		size_t i = index[key];
		return &table.data()[i];
	}

	bool TryGet(KeyT key, T*& out)
	{
		if (index.count(key) == 0) return false;

		size_t i = index[key];
		out = &table.data()[i];

		return true;
	}

	void Insert(T value)
	{
		assert(index.count(value.id) == 0);

		KeyT id = value.id;

		size_t i = table.size();
		table.push_back(std::move(value));
		index[id] = i;
	}
};

// --- TABLE ID TYPES ---

struct Place_ID {
	int32_t id;
	Place_ID() = default;
	explicit Place_ID(int32_t id) : id(id) {}
	operator int32_t() const { return id; }
	bool operator==(const Place_ID& other) const { return id == other.id; }
};

struct Publication_ID {
	int32_t id;
	Publication_ID() = default;
	explicit Publication_ID(int32_t id) : id(id) {}
	operator int32_t() const { return id; }
	bool operator==(const Publication_ID& other) const { return id == other.id; }
};

struct Area_ID {
	Place_ID id;
	int16_t t;
	Area_ID() = default;
	Area_ID(Place_ID id, int16_t t) : id(id), t(t) {}
	bool operator==(const Area_ID& other) const { return id == other.id && t == other.t; }
};

struct AreaStat_ID {
	Place_ID id;
	int16_t z;
	AreaStat_ID() = default;
	AreaStat_ID(int32_t id, int16_t z) : id(id), z(z) {}
	bool operator==(const AreaStat_ID& other) const { return id == other.id && z == other.z; }
};

struct PreTile_ID {
	int16_t x;
	int16_t y;
	int16_t z;
	int16_t t;
	PreTile_ID() = default;
	PreTile_ID(int16_t x, int16_t y, int16_t z, int16_t t) : x(x), y(y), z(z), t(t) {}
	bool operator==(const PreTile_ID& other) const { return x == other.x && y == other.y && z == other.z && t == other.t; }
};

struct TileStat_ID {
	int16_t t;
	int16_t z;
	TileStat_ID() = default;
	TileStat_ID(int16_t t, int16_t z) : t(t), z(z) {}
	bool operator==(const TileStat_ID& other) const { return t == other.t && z == other.z; }
};

struct Point_ID {
	uint8_t x;
	uint8_t y;
	Point_ID() = default;
	explicit Point_ID(uint8_t x, uint8_t y) : x(x), y(y) {}
	bool operator==(const Point_ID& other) const { return x == other.x && y == other.y; }
};

namespace std {
	template <>
	struct hash<Place_ID> {
		size_t operator()(const Place_ID& key) const
		{
			return hash<int32_t>()(key.id);
		}
	};

	template <>
	struct hash<Publication_ID> {
		size_t operator()(const Publication_ID& key) const
		{
			return hash<int32_t>()(key.id);
		}
	};

	template <>
	struct hash<Area_ID> {
		size_t operator()(const Area_ID& key) const
		{
			size_t ret = 17;
			ret = ret * 31 + hash<int32_t>()(key.id);
			ret = ret * 31 + hash<int16_t>()(key.t);
			return ret;
		}
	};

	template <>
	struct hash<AreaStat_ID> {
		size_t operator()(const AreaStat_ID& key) const
		{
			size_t ret = 17;
			ret = ret * 31 + hash<int32_t>()(key.id);
			ret = ret * 31 + hash<int16_t>()(key.z);
			return ret;
		}
	};

	template <>
	struct hash<PreTile_ID> {
		size_t operator()(const PreTile_ID& key) const
		{
			size_t ret = 17;
			ret = ret * 31 + hash<int16_t>()(key.x);
			ret = ret * 31 + hash<int16_t>()(key.y);
			ret = ret * 31 + hash<int16_t>()(key.z);
			ret = ret * 31 + hash<int16_t>()(key.t);
			return ret;
		}
	};

	template <>
	struct hash<TileStat_ID> {
		size_t operator()(const TileStat_ID& key) const
		{
			size_t ret = 17;
			ret = ret * 31 + hash<int16_t>()(key.t);
			ret = ret * 31 + hash<int16_t>()(key.z);
			return ret;
		}
	};

	template <>
	struct hash<Point_ID> {
		size_t operator()(const Point_ID& key) const
		{
			size_t ret = 17;
			ret = ret * 31 + hash<uint8_t>()(key.x);
			ret = ret * 31 + hash<uint8_t>()(key.y);
			return ret;
		}
	};
}

// --- TABLE TYPES ---

struct Place {
	typedef Place_ID KeyT;
	Place_ID id;
	std::string name;
	Vector2 mercatorPoint;
	Place(Place_ID id, std::string name, Vector2 mercatorPoint) : id(id), name(std::move(name)), mercatorPoint(mercatorPoint) {}
};

struct Polygon {
	typedef Place_ID KeyT;
	Place_ID id;
	std::vector<std::vector<std::vector<Vector2>>> points; // polygons -> loops -> coords
	std::array<std::vector<Vector2>, MAX_EXPANSION_LEVEL + 1> expansions;
	explicit Polygon(Place_ID id) : id(id) {}
};

struct Publication {
	typedef Publication_ID KeyT;
	Publication_ID id;
	std::string title;
	std::string author;
	std::string publicationPlace;
	int16_t year;
	std::vector<Place_ID> places;
	Publication(Publication_ID id, std::string title, std::string author, std::string publicationPlace, int16_t year, std::vector<Place_ID> places)
		: id(id), title(std::move(title)), author(std::move(author)), publicationPlace(std::move(publicationPlace)), year(year), places(places) {}
};

struct Area {
	typedef Area_ID KeyT;
	Area_ID id;
	std::vector<Publication_ID> publications;
	Area(Area_ID id, Publication_ID publication_id) : id(id), publications{publication_id} {}
};

struct AreaStat {
	typedef AreaStat_ID KeyT;
	AreaStat_ID id;
	int32_t pointCount;
	AreaStat(AreaStat_ID id, int32_t pointCount) : id(id), pointCount(pointCount) {}
};

struct Point {
	typedef Point_ID KeyT;
	Point_ID id;
	std::vector<Place_ID> areas;
	std::vector<Publication_ID> publications;
	explicit Point(Point_ID id) : id(id) {}
};

struct PreTile {
	typedef PreTile_ID KeyT;
	PreTile_ID id;
	Table<Point> points;
	explicit PreTile(PreTile_ID id) : id(id) {}
};

struct TileStat {
	typedef TileStat_ID KeyT;
	TileStat_ID id;
	double max;
	explicit TileStat(TileStat_ID id) : id(id), max(-INFINITY) {}
};

struct Data {
	Table<Publication> publications;
	Table<Area> areas;
	Table<AreaStat> areaStats;
	Table<PreTile> preTiles;
	Table<TileStat> tileStats;

	Table<Place> places;
	Table<Polygon> polygons;

	std::unordered_map<std::string, Place_ID> placeNameIndex;

	void MakePlaceNameIndex();
	bool TryGetPlaceByName(const std::string& name, Place*& out);
};

extern Data gData;

// --- OTHER FUNCTION DECLARATIONS ---

bool PointInPolygon(Vector2 point, const std::vector<std::vector<Vector2>>& loops, const std::vector<std::pair<uint32_t, uint32_t>>& edges);
bool PointInPolygon(Vector2 point, const std::vector<std::vector<Vector2>>& loops);

inline Vector2 GeoCoordToMercator(float lonDeg, float latDeg)
{
	float x = (lonDeg + 180.0f) / 360.0f;
	float latRad = latDeg * M_PIf / 180.0f;
	float y = (1.0f - asinhf(tanf(latRad)) / M_PIf) / 2.0f;

	return Vector2(x, y);
}

inline TileCoord MercatorToTileCoord(Vector2 coords, int z)
{
	coords.x *= 1 << z;
	coords.y *= 1 << z;
	return {
		(int16_t)floorf(coords.x),
		(int16_t)floorf(coords.y),
		(uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(coords.x, 1.0f) + 1.0f, 1.0f)),
		(uint8_t)floorf(TILE_PIXEL_SIZE * fmodf(fmodf(coords.y, 1.0f) + 1.0f, 1.0f)),
	};
}

inline TileCoord GeoCoordToTileCoord(float lonDeg, float latDeg, int z)
{
	return MercatorToTileCoord(GeoCoordToMercator(lonDeg, latDeg), z);
}

inline unsigned int RaycastEdge(Vector2 point, Vector2 a, Vector2 b)
{
	if ((point.y >= a.y) == (point.y >= b.y)) return 0;

	float pax = a.x - point.x;
	float pay = a.y - point.y;
	float pbx = b.x - point.x;
	float pby = b.y - point.y;

	float cross = pax * pby - pbx * pay;
	float dy = b.y - a.y;

	float sgn = cross * dy;

	return sgn >= 0.0f ? 1 : 0;
}

inline unsigned int RaycastEdge_x8(__m256 px, __m256 py, __m256 ax, __m256 ay, __m256 bx, __m256 by)
{
	__m256 a = _mm256_cmp_ps(py, ay, _CMP_GE_OQ);
	__m256 b = _mm256_cmp_ps(py, by, _CMP_GE_OQ);
	__m256 r = _mm256_xor_ps(a, b);

	uint8_t mask = (uint8_t)_mm256_movemask_ps(r);

	if (mask == 0) return 0;

	__m256 pax = _mm256_sub_ps(ax, px);
	__m256 pay = _mm256_sub_ps(ay, py);
	__m256 pbx = _mm256_sub_ps(bx, px);
	__m256 pby = _mm256_sub_ps(by, py);

	__m256 cross = _mm256_sub_ps(_mm256_mul_ps(pax, pby), _mm256_mul_ps(pbx, pay));
	__m256 dy = _mm256_sub_ps(by, ay);

	__m256 sgn = _mm256_mul_ps(cross, dy);
	mask &= ~(uint8_t)_mm256_movemask_ps(sgn);
	return 8U - (unsigned int)_mm_popcnt_u32(mask);
}
