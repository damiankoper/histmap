<template>
  <el-row align="middle" justify="start" :gutter="8" class="title-wrapper">
    <el-image
      :src="require('@/assets/images/world_map_dark.svg')"
      alt="World map"
    />
    <p>
      <span>HIST</span>
      <span>map</span>
    </p>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.title-wrapper {
  -khtml-user-select: none;
  -o-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}
.el-image {
  height: 2.5rem;
}
p {
  margin: 0 0 0 4px;
  font-size: 2rem;
  span:first-child {
    font-weight: 700;
  }
  span:last-child {
    font-weight: 300;
  }
}
</style>
