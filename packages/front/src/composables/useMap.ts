import * as L from "leaflet";
import { onMounted, onUnmounted, Ref, shallowRef, watch } from "vue";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { GlobalStats } from "@/interfaces/GlobalStats";

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

export function useMap(
  container: Ref<HTMLElement | null>,
  year: Ref<number>,
  place: Ref<string>,
  author: Ref<string>,
  title: Ref<string>
) {
  const map: Ref<L.Map | null> = shallowRef(null);
  let circle: L.Circle | null = null;
  let marker: L.Marker | null = null;
  let heatMapLayer: L.TileLayer | null = null;

  function setUrl(heatMapLayer: L.TileLayer) {
    heatMapLayer.setUrl(
      `${process.env.VUE_APP_API_URL}/tiles/${year.value}/{z}/{x}/{y}.png`
    );
  }

  function setUrlWithQueryParams(heatMapLayer: L.TileLayer) {
    heatMapLayer.setUrl(
      `${process.env.VUE_APP_API_URL}/tiles/${year.value}/{z}/{x}/{y}.png?author=${author.value}&title=${title.value}&place=${place.value}`
    );
  }

  watch(year, () => {
    if (heatMapLayer) setUrl(heatMapLayer);
  });

  watch([place, author, title], () => {
    console.log("rekłest");
    if (heatMapLayer) setUrlWithQueryParams(heatMapLayer);
  });

  onMounted(() => {
    if (!container.value) throw new Error("Invalid map container!");

    map.value = L.map(container.value, { zoomControl: false }).setView(
      [52, 20],
      6
    );
    map.value.doubleClickZoom.disable();

    const osmLayer = L.tileLayer(osmTileURL, {
      attribution: osmTileAttr,
      maxZoom: 10,
    });

    heatMapLayer = L.tileLayer("", {
      maxZoom: 10,
      opacity: 0.9,
    });
    setUrl(heatMapLayer);

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

  function setZoomRange(stats: GlobalStats) {
    if (map.value) {
      map.value.setMinZoom(stats.zMin);
      map.value.setMaxZoom(stats.zMax);
    }
  }

  return {
    map,
    setArea,
    clearArea,
    setSearchResult,
    clearSearchResult,
    setZoomRange,
  };
}
