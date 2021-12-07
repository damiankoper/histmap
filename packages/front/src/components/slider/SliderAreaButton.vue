<template>
  <!-- necessary div to use @click in parent  -->
  <div style="margin-right: 10px">
    <el-tooltip
      placement="top"
      :content="showAreas ? 'Obszary widoczne' : 'Obszary ukryte'"
    >
      <el-button
        circle
        style="font-size: 1rem; padding: 8px; min-height: initial"
        :type="showAreas ? 'primary' : 'info'"
        size="small"
      >
        <span class="mdi-set mdi-map-search" />
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    showAreas: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    return {};
  },
};
</script>
