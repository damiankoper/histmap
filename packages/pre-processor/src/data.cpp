#include "data.h"

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

bool PointInPolygon(Vector2 point, const std::vector<Vector2>& points)
{
	size_t len = points.size();

	int winding = 0;
	Vector2 b = points[len - 1];
	for (size_t i = 0; i < len; ++i)
	{
		Vector2 a = points[i];

		winding += RaycastEdge(point, a, b);

		b = a;
	}

	return (winding & 1) != 0;
}
