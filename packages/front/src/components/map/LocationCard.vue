<template>
  <el-row align="middle" class="location-row">
    <i
      class="location-icon mdi-set mdi-map-marker-outline"
      style="font-size: 1.5rem; cursor: pointer"
    ></i>
    <p>{{ location.label }}</p>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MapSearchResult } from "@/composables/useMap";

export default defineComponent({
  props: {
    location: {
      type: Object as PropType<MapSearchResult>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.location-row {
  cursor: pointer;
  transition: background 0.3s ease;
  margin: 8px 0;
  &:hover {
    background: #ebeef5;
  }
  p {
    font-size: 12px;
    width: 220px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.location-icon {
  margin: 0 20px;
}
</style>
