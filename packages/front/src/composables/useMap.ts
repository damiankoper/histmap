import * as L from "leaflet";
import { onMounted, onUnmounted, Ref, ref } from "vue";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import _ from "lodash";

const osmTileURL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmTileAttr =
  'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapSearchResult {
  point: L.LatLngExpression;
  bounds: L.LatLngBoundsExpression;
  label: string;
  id?: string;
}

export interface MapArea {
  point: L.LatLngExpression;
  radius: number;
}

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export function useMap(container: Ref<HTMLElement | null>) {
  const map: Ref<L.Map | null> = ref(null);
  let circle: L.Circle | null = null;
  let marker: L.Marker | null = null;
  let heatMapLayer: L.TileLayer | null = null;

  onMounted(() => {
    if (!container.value) throw new Error("Invalid map container!");

    map.value = L.map(container.value, { zoomControl: false }).setView(
      [52, 20],
      6
    );

    const osmLayer = L.tileLayer(osmTileURL, {
      attribution: osmTileAttr,
      maxZoom: 10,
    });

    heatMapLayer = L.tileLayer(
      "https://tilecache.rainviewer.com/v2/radar/1636324200/256/{z}/{x}/{y}/1/1_1.png",
      {
        attribution: "&copy; Rainviewer",
        maxZoom: 10,
      }
    );

    const zoom = new L.Control.Zoom({ position: "bottomright" });

    map.value.addLayer(osmLayer);
    map.value.addLayer(heatMapLayer);
    map.value.addControl(zoom);
  });

  onUnmounted(() => {
    map.value?.remove();
    map.value = null;
  });

  function setArea(area: MapArea) {
    if (map.value) {
      circle = new L.Circle(area.point, { radius: area.radius });
      map.value.addLayer(circle);
    }
  }
  function clearArea() {
    if (map.value && circle) {
      map.value.removeLayer(circle);
      circle = null;
    }
  }

  function setSearchResult(search: MapSearchResult) {
    if (map.value) {
      marker = new L.Marker(search.point, { title: search.label });
      map.value.addLayer(marker);
      map.value.flyToBounds(search.bounds);
    }
  }

  function clearSearchResult() {
    if (map.value && marker) {
      map.value.removeLayer(marker);
      marker = null;
    }
  }

  function redrawHeatMap() {
    heatMapLayer?.redraw();
  }

  return {
    map,
    setArea,
    clearArea,
    setSearchResult,
    clearSearchResult,
    redrawHeatMap: _.debounce(redrawHeatMap, 100),
  };
}
