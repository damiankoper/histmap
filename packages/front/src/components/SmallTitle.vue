<template>
  <el-row align="middle">
    <el-image
      :src="require('../assets/images/world_map.svg')"
      alt="world map"
    />
    <p>HISTmap</p>
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
p {
  letter-spacing: 8px;
  margin: 0 0 0 16px;
}
</style>
