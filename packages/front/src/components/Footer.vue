<template>
  <el-footer class="footer" height="16px">
    Created by
    <a href="https://github.com/damiankoper" target="_blank">@damiankoper </a>
    <a href="https://github.com/iszn11" target="_blank">@iszn11 </a>
    <a href="https://github.com/hergerr" target="_blank">@hergerr </a>
    <a href="https://github.com/matgwi96" target="_blank">@matgwi96</a>. All
    rights resevered
  </el-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  padding: 4px 0;
  font-size: 8px;
  background-color: white;

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>
