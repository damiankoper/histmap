<template>
  <div class="search-container">
    <div class="search-input">
      <MenuBurger @click="$emit('click')" />
      <el-input v-model="input" :placeholder="placeholder" />
      <i
        v-if="placeholder !== 'Szukaj miejsca'"
        class="mdi-set mdi-close"
        style="font-size: 1.5rem; cursor: pointer"
        @click="cancelClicked"
      ></i>
    </div>

    <LocationCard
      v-for="location in locationsList"
      :key="location.id"
      :location="location"
      @click="locationClicked(location)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import MenuBurger from "../layout/MenuBurger.vue";
import LocationCard from "./LocationCard.vue";
import ApiLocation from "../../interfaces/ApiLocation";
import ApiLocationDetails from "../../interfaces/ApiLocationDetails";
import useApi from "../../composables/useApi";
import _ from "lodash";
import { MapSearchResult } from "@/composables/useMap";
import * as L from "leaflet";

export default defineComponent({
  components: { MenuBurger, LocationCard },
  props: {
    modelValue: { type: String, default: "" },
  },
  emits: ["location", "click"],
  setup(props, { emit }) {
    const DEFAULT_PLACEHOLDER = "Szukaj miejsca";
    const input = ref("");
    const locationsList = ref<MapSearchResult[]>([]);
    const placeholder = ref<string>(DEFAULT_PLACEHOLDER);

    const locationClicked = (location: MapSearchResult) => {
      emit("location", location);
      input.value = "";
      placeholder.value = location.label;
      locationsList.value = [];
    };

    const cancelClicked = () => {
      emit("location", null);
      placeholder.value = DEFAULT_PLACEHOLDER;
    };

    watch(
      input,
      _.debounce(async () => {
        const { fetch, data } = useApi<ApiLocation>(
          encodeURI(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?access_token=pk.eyJ1IjoiaGVycmdlcnIiLCJhIjoiY2t2cWwyOHhpMjQ1bTJ4b3U5cjBzem10NSJ9.biRPWndoVnsjQDiNDTssSQ`
          )
        );

        try {
          await fetch();
          if (data.value !== null) {
            locationsList.value = data.value.features.map(
              (item: ApiLocationDetails) => {
                const point: L.LatLngTuple = [item.center[1], item.center[0]];

                let bounds: L.LatLngBoundsLiteral;
                if (item.bbox) {
                  const southWest: L.LatLngTuple = [item.bbox[1], item.bbox[0]];
                  const northEast: L.LatLngTuple = [item.bbox[3], item.bbox[2]];
                  bounds = [southWest, northEast];
                } else {
                  bounds = [point, point];
                }

                const location: MapSearchResult = {
                  id: item.id,
                  point: point,
                  bounds: bounds,
                  label: item.place_name,
                };
                return location;
              }
            );
          }
        } catch (error) {
          console.log(error);
        }
      }, 500)
    );

    return {
      input,
      locationsList,
      locationClicked,
      cancelClicked,
      placeholder,
    };
  },
});
</script>

<style lang="scss" scoped>
.search-container {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  /* https://stackoverflow.com/a/3724210 */
  overflow: hidden;

  .search-input {
    display: flex;
    align-items: center;
    width: 300px;
    border-radius: 24px;
    padding: 4px 8px 4px 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  }
}
.el-input {
  :deep(input) {
    border: none;
  }
}
</style>
