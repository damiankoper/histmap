#include "data.h"

#include <immintrin.h>

Data gData;

void Data::MakePlaceNameIndex()
{
	placeNameIndex.clear();

	for (const Place& place : places.table)
	{
		placeNameIndex[place.name] = place.id;
	}
}

bool Data::TryGetPlaceByName(const std::string& name, Place*& out)
{
	if (placeNameIndex.count(name) == 0) return false;

	Place_ID place_id = placeNameIndex[name];
	out = &places.table[places.index[place_id]];

	return true;
}

bool PointInPolygon(Vector2 point, const std::vector<std::vector<Vector2>>& loops, const std::vector<std::pair<uint32_t, uint32_t>>& edges)
{
	unsigned int winding = 0;
	for (const auto& [loopID, vi] : edges)
	{
		const std::vector<Vector2>& loop = loops[loopID];
		uint32_t vj = vi + 1 >= loop.size() ? 0 : vi + 1;

		winding += RaycastEdge(point, loop[vi], loop[vj]);
	}

	return (winding & 1) != 0;
}

bool PointInPolygon(Vector2 point, const std::vector<std::vector<Vector2>>& loops)
{
	unsigned int winding = 0;

	for (const std::vector<Vector2>& points : loops)
	{
		const size_t len = points.size();

		size_t i = 0;

		/*const __m256 px = _mm256_set1_ps(point.x);
		const __m256 py = _mm256_set1_ps(point.y);
		for (; i + 8 < len; i += 8)
		{
			float xbuf[9];
			float ybuf[9];

			__m256 points1 = _mm256_loadu_ps(&points[i].x);     // [x0 y0 x1 y1 x2 y2 x3 y3]
			__m256 points2 = _mm256_loadu_ps(&points[i + 4].x); // [x4 y4 x5 y5 x6 y6 x7 y7]

			__m256 a = _mm256_permute2f128_ps(points1, points2, 0b0010'0000); // [x0 y0 x1 y1 x4 y5 x5 y5]
			__m256 b = _mm256_permute2f128_ps(points1, points2, 0b0011'0001); // [x2 y2 x3 y3 x6 y6 x7 y7]

			__m256 ax = _mm256_shuffle_ps(a, b, 0b10'00'10'00); // [x0 x1 x2 x3 x4 x5 x6 x7]
			__m256 ay = _mm256_shuffle_ps(a, b, 0b11'01'11'01); // [y0 y1 y2 y3 y4 y5 y6 y7]

			_mm256_storeu_ps(&xbuf[0], ax);
			_mm256_storeu_ps(&ybuf[0], ay);

			Vector2 v8 = points[8];

			xbuf[8] = v8.x;
			ybuf[8] = v8.y;

			__m256 bx = _mm256_loadu_ps(&xbuf[1]);
			__m256 by = _mm256_loadu_ps(&ybuf[1]);

			winding += RaycastEdge_x8(px, py, ax, ay, bx, by);
		}*/

		for (;i + 1 < len; ++i)
		{
			winding += RaycastEdge(point, points[i], points[i + 1]);
		}

		winding += RaycastEdge(point, points[len - 1], points[0]);
	}

	return (winding & 1) != 0;
}
