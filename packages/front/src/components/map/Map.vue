<template>
  <div ref="container" class="map"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, toRef, watch } from "vue";
import { MapArea, MapSearchResult, useMap } from "@/composables/useMap";
import { GlobalStats } from "@/interfaces/GlobalStats";

export default defineComponent({
  props: {
    area: {
      type: Object as PropType<MapArea | null>,
    },
    search: {
      type: Object as PropType<MapSearchResult | null>,
    },
    year: {
      type: Number,
      default: 0,
    },
    globalStats: {
      type: Object as PropType<GlobalStats | null>,
    },
  },
  emits: ["click", "dblclick", "zoom"],
  setup(props, { emit }) {
    const container = ref<HTMLElement | null>(null);
    const {
      map,
      setArea,
      clearArea,
      setSearchResult,
      clearSearchResult,
      setZoomRange,
    } = useMap(container, toRef(props, "year"));

    onMounted(() => {
      watch(
        () => props.area,
        () => {
          clearArea();
          if (props.area) setArea(props.area);
        },
        { immediate: true }
      );

      watch(
        () => props.search,
        () => {
          clearSearchResult();
          if (props.search) setSearchResult(props.search);
        },
        { immediate: true }
      );

      watch(
        () => props.globalStats,
        () => {
          if (props.globalStats) setZoomRange(props.globalStats);
        }
      );

      if (map.value) {
        map.value.on("dblclick", (e) => emit("dblclick", e));
        map.value.on("click", (e) => emit("click", e));
        emit("zoom", map.value.getZoom());
        map.value.on("zoom", () => emit("zoom", map.value?.getZoom() || 0));
      }
    });
    return {
      container,
    };
  },
});
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
  width: 100%;
}
</style>
