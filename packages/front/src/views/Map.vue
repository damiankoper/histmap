<template>
  <el-container class="container" direction="vertical">
    <div class="search-wrapper">
      <SearchInput @location="onLocation" @click="formDialogVisible = true" />
    </div>
    <Map
      class="map"
      :area="mapArea"
      :search="mapSearch"
      :year="year"
      @click="onMapClick"
      @zoom="onZoomChange"
    />
    <TimelineSlider v-model:year="year" />
  </el-container>
  <FormDrawer v-model:visible="formDialogVisible" />
  <ListDrawer v-model:visible="listDialogVisible" />
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

export default defineComponent({
  components: {
    Footer,
    SearchInput,
    TimelineSlider,
    Map,
    FormDrawer,
    ListDrawer,
  },
  setup() {
    const year = ref(1990);
    const zoom = ref(1);

    const formDialogVisible = ref(false);
    const listDialogVisible = ref(false);

    const mapSearch = ref<MapSearchResult | null>(null);
    const mapArea = ref<MapArea | null>(null);

    /**
     * ! Example - real antrypoint in onMapClick function
     */
    onMounted(() => {
      setTimeout(() => {
        mapSearch.value = {
          point: [51.10773, 17.03533],
          bounds: [
            [51.042675448, 16.807383846],
            [51.210053, 17.176219176],
          ],
          label: "Wrocław, Lower Silesian Voivodeship, Poland",
        };
      }, 2000);
    });

    return {
      year,
      mapSearch,
      mapArea,
      formDialogVisible,
      listDialogVisible,
      onMapClick(e: L.LeafletMouseEvent) {
        const r = 20000000 / 2 ** Math.max(zoom.value, 0);
        mapArea.value = {
          point: e.latlng,
          radius: r,
        };
        /* 
        TODO: entrypoint for areaSearch
        1.1 open ListDrawer in loading state (:isLoading)
        1.2 send request with {point: e.latlng, radius: r}
        !e.g. GET /area?lat=12.123&lng=12.123&r=123123
        2. Pass result list to ListDrawer via props
        ! "r" is in meters
        For api call build new composable:
        * https://vuedose.tips/use-composition-api-to-easily-handle-api-requests-in-vue-js
        * https://github.com/damiankoper/hhapp/blob/faa27f94c240cbac5b8f6581b3f6c43815f0e4a9/packages/frontend/composables/useApi.ts
        */
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

.map {
  z-index: 2;
}

.slider-wrapper {
  position: absolute;
  width: 100%;
  z-index: 3;
}
</style>
