<template>
  <!-- necessary div to use @click in parent  -->
  <div>
    <el-tooltip
      placement="top"
      :content="byYear ? 'Widok wybranego roku' : 'Widok wszystkich lat'"
    >
      <el-button
        circle
        style="font-size: 1rem; padding: 8px; min-height: initial"
        :type="byYear ? 'primary' : 'info'"
        size="small"
      >
        <span class="mdi-set mdi-calendar-outline" />
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    byYear: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    return {};
  },
};
</script>
