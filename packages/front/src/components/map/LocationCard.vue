<template>
  <el-row
    v-loading="loading"
    align="middle"
    class="location-row"
    justify="start"
  >
    <i
      v-if="emptyResults"
      class="location-icon mdi-set mdi-map-marker-question-outline"
    />
    <i
      v-else-if="error"
      class="location-icon mdi-set mdi-map-marker-alert-outline"
    />
    <i v-else class="location-icon mdi-set mdi-map-marker-outline" />
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
    error: {
      type: Boolean,
      default: false,
    },
    emptyResults: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
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
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  flex-wrap: nowrap;
  &:hover {
    background: #ebeef5;
  }
  p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 14px;
    padding: 0 15px;
  }
}
.location-icon {
  min-width: 32px;
  text-align: center;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
