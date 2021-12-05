<template>
  <div class="search-container" ref="searchContainer">
    <div class="search-input">
      <el-badge style="z-index: 9" is-dot :hidden="!hasFilters">
        <MenuBurger @click="$emit('click')" />
      </el-badge>
      <el-input
        v-model="input"
        :placeholder="selected ? placeholder : 'Szukaj miejsca'"
        @keydown="markOption"
      />
      <i
        v-if="selected"
        class="mdi-set mdi-close"
        style="
          font-size: 1.5rem;
          cursor: pointer;
          text-align: center;
          width: 32px;
        "
        @click="cancelClicked"
      />
    </div>

    <LocationCard
      v-for="(location, index) in locationsList"
      :key="location.id"
      :location="location"
      :focus="index === focus"
      @click="locationClicked(location)"
      @mouseover="focus = index"
    />
    <LocationCard
      v-if="displayEmpty"
      :location="{ label: 'Brak wyników wyszukiwania' }"
      :error="!!err"
      :loading="loading"
      :focus="false"
      empty-results
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import MenuBurger from "../layout/MenuBurger.vue";
import LocationCard from "./LocationCard.vue";
import ApiLocation from "../../interfaces/ApiLocation";
import ApiLocationDetails from "../../interfaces/ApiLocationDetails";
import useApi from "../../composables/useApi";
import { MapSearchResult } from "@/composables/useMap";
import { useKeypress } from "vue3-keypress";
import * as L from "leaflet";
import _ from "lodash";

export default defineComponent({
  components: { MenuBurger, LocationCard },
  props: {
    modelValue: { type: String, default: "" },
    hasFilters: { type: Boolean, default: false },
  },
  emits: ["location", "click"],
  setup(props, { emit }) {
    const searchContainer = ref<HTMLElement | null>(null);
    const input = ref("");
    const initialSearch = ref(false);
    const selected = ref(false);
    const placeholder = ref("");
    const focus = ref<number>(0);

    const selectLocation = () => {
      const choosenLocation = locationsList.value[focus.value];
      locationClicked(choosenLocation);
    };

    useKeypress({
      keyEvent: "keydown",
      keyBinds: [
        {
          keyCode: "enter",
          success: selectLocation,
        },
      ],
    });

    const locationClicked = (location: MapSearchResult) => {
      emit("location", location);
      input.value = "";

      placeholder.value = location.label;
      selected.value = true;
      data.value = null;
    };

    const cancelClicked = () => {
      emit("location", null);
      selected.value = false;
      initialSearch.value = false;
    };

    const token =
      "pk.eyJ1IjoiaGVycmdlcnIiLCJhIjoiY2t3dDNpMXpyMWNkbjJvcDNpeGhyZDd3MCJ9.lqGPz68Zp9YpALPHNbrtYw";
    const { fetch, data, err, loading } = useApi<ApiLocation>(() =>
      encodeURI(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?types=place&language=pl&access_token=${token}`
      )
    );
    function clickAwayHandler(event: MouseEvent) {
      if (event.target) {
        const target = event.target as Node;
        const el = searchContainer.value;
        var isClickInside = !el || el == target || el.contains(target);
        if (!isClickInside) {
          input.value = "";
          data.value = null;
          if (selected.value) {
            //
          } else {
            initialSearch.value = false;
          }
        }
      }
    }
    onMounted(() => {
      document.addEventListener("click", clickAwayHandler);
    });
    onUnmounted(() => {
      document.removeEventListener("click", clickAwayHandler);
    });

    const locationsList = computed<MapSearchResult[]>(() => {
      return (
        data.value?.features.map((item: ApiLocationDetails) => {
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
        }) || []
      );
    });

    const displayEmpty = computed(() => {
      return (
        (err.value || loading.value || !locationsList.value.length) &&
        initialSearch.value &&
        !selected.value
      );
    });

    const markOption = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          if (focus.value === null) {
            focus.value = 0;
          } else if (focus.value < locationsList.value.length - 1) {
            focus.value++;
          } else if (focus.value == locationsList.value.length - 1) {
            focus.value = 0;
          }
          break;
        case "ArrowUp":
          if (focus.value === null) {
            focus.value = 0;
          } else if (focus.value > 0) {
            focus.value--;
          }
          break;
      }
    };

    watch(
      input,
      _.debounce(async () => {
        try {
          if (input.value.length >= 3) {
            initialSearch.value = true;
            await fetch();
          }
        } catch (error) {
          console.error(error);
        }
      }, 500)
    );

    return {
      searchContainer,
      err,
      focus,
      markOption,
      selected,
      loading,
      input,
      locationsList,
      locationClicked,
      cancelClicked,
      placeholder,
      displayEmpty,
    };
  },
});
</script>

<style lang="scss" scoped>
.search-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  /* https://stackoverflow.com/a/3724210 */
  overflow: hidden;
  width: 350px;

  .search-input {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 4px 8px 4px 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  }
}
.el-input {
  :deep(input) {
    border: none;
    text-overflow: ellipsis;
  }
}
</style>
