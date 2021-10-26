<template>
  <el-footer class="footer" height="32px">
    <span>
      Copyright © [<a href="https://github.com/damiankoper" target="_blank"
        >@damiankoper </a
      >, <a href="https://github.com/iszn11" target="_blank">@iszn11 </a>,
      <a href="https://github.com/hergerr" target="_blank">@hergerr </a>,
      <a href="https://github.com/matgwi96" target="_blank">@matgwi96</a>]
      {{ new Date().getFullYear() }}
    </span>
    <span>Made with ❤️</span>
  </el-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  padding: 4px 8px;
  font-size: 16px;
  background-color: white;
  display: flex;
  justify-content: space-between;

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>
