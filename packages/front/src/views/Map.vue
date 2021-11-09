<template>
  <el-container class="container" direction="vertical">
    <div style="position: relative; height: 100%">
      <div class="search-wrapper">
        <SearchInput @location="onLocation" @click="formDialogVisible = true" />
      </div>
      <div class="legend-wrapper">
        <Legend :year="year" />
      </div>
      <Map
        class="map"
        :area="mapArea"
        :search="mapSearch"
        :year="year"
        @dblclick="onMapDblClick"
        @click="onMapClick"
        @zoom="onZoomChange"
      />
    </div>
    <TimelineSlider v-model:year="year" />
  </el-container>
  <FormDrawer v-model:visible="formDialogVisible" />
  <ListDrawer
    v-model:visible="listDialogVisible"
    :loading="loading"
    :publications="data"
  />
  <Footer />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import Footer from "../components/layout/Footer.vue";
import SearchInput from "../components/map/SearchInput.vue";
import Map from "../components/map/Map.vue";
import TimelineSlider from "../components/slider/TimelineSlider.vue";
import useApi from "../composables/useApi";
import { MapArea, MapSearchResult } from "@/composables/useMap";
import * as L from "leaflet";

import FormDrawer from "../components/filters/FormDrawer.vue";
import ListDrawer from "../components/publications/ListDrawer.vue";
import Publication from "@/interfaces/Publication";
import Legend from "@/components/map/Legend.vue";

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

    const { fetch, data, loading } = useApi<Publication>(
      "http://127.0.0.1:3000/publications"
    );

    return {
      year,
      loading,
      data,
      mapSearch,
      mapArea,
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
        // TODO params to be added when API will be ready ({point: e.latlng, radius: r})
        fetch();
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
  top: 8px;
  right: 8px;
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
