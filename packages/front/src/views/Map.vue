<template>
  <el-container class="container" direction="vertical">
    <div style="position: relative; height: 100%">
      <div class="search-wrapper">
        <SearchInput @location="onLocation" @click="formDialogVisible = true" />
      </div>
      <div class="legend-wrapper">
        <Legend :year="year" :zoom="zoom" />
      </div>
      <Map
        class="map"
        :area="mapArea"
        :search="mapSearch"
        :year="year"
        :global-stats="globalStats"
        @dblclick="onMapDblClick"
        @click="onMapClick"
        @zoom="onZoomChange"
      />
    </div>
    <TimelineSlider v-model:year="year" :global-stats="globalStats" />
  </el-container>
  <!-- TODO:  -->
  <FormDrawer v-model:visible="formDialogVisible" />
  <ListDrawer
    v-model:visible="listDialogVisible"
    :map-area="mapArea"
    :year="year"
  />
  <Footer />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import Footer from "../components/layout/Footer.vue";
import SearchInput from "../components/map/SearchInput.vue";
import Map from "../components/map/Map.vue";
import TimelineSlider from "../components/slider/TimelineSlider.vue";
import { MapArea, MapSearchResult } from "@/composables/useMap";
import * as L from "leaflet";
import FormDrawer from "../components/filters/FormDrawer.vue";
import ListDrawer from "../components/publications/ListDrawer.vue";
import Legend from "@/components/map/Legend.vue";
import useApi from "@/composables/useApi";
import { GlobalStats } from "@/interfaces/GlobalStats";

export default defineComponent({
  components: {
    Footer,
    SearchInput,
    TimelineSlider,
    Map,
    FormDrawer,
    ListDrawer,
    Legend,
  },
  setup() {
    const year = ref(1990);
    const zoom = ref(1);

    const formDialogVisible = ref(false);
    const listDialogVisible = ref(false);

    const mapSearch = ref<MapSearchResult | null>(null);
    const mapArea = ref<MapArea | null>(null);

    const { data: globalStats, fetch } =
      useApi<GlobalStats>("tiles/stats/global");

    onMounted(fetch);

    return {
      year,
      zoom,
      mapSearch,
      mapArea,
      globalStats,
      formDialogVisible,
      listDialogVisible,
      onMapClick(_e: L.LeafletMouseEvent) {
        mapArea.value = null;
      },
      onMapDblClick(e: L.LeafletMouseEvent) {
        const r = 20000000 / 2 ** Math.max(zoom.value, 0);
        mapArea.value = {
          point: e.latlng,
          radius: r,
        };
        listDialogVisible.value = true;
      },
      onZoomChange(z: number) {
        zoom.value = z;
      },
      onLocation(location: MapSearchResult) {
        mapSearch.value = location;
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 32px);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.search-wrapper {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
}
.legend-wrapper {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 3;
}
.map {
  z-index: 2;
}

.slider-wrapper {
  position: absolute;
  width: 100%;
  z-index: 3;
}
</style>
