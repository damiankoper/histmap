<template>
  <el-row
    v-loading="loading"
    align="middle"
    class="location-row"
    :class="{ focus: cardFocus }"
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
import { defineComponent, PropType, toRef } from "vue";
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
    focus: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    return {
      cardFocus: toRef(props, "focus"),
    };
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
  margin: 12px 0;
  /* without margin first element overlaps shadow of search input */
  /* &:first-child does not work somehow in this case */
  /* but such margin is also nice */
  p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 14px;
    padding: 0 15px;
  }
}

.focus {
  background: #ebeef5;
}

.location-icon {
  min-width: 32px;
  text-align: center;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
