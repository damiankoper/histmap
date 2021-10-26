<template>
  <el-footer class="footer" height="32px">
    <span>
      Copyright © {{ new Date().getFullYear() }} |
      <a href="https://github.com/damiankoper" target="_blank">
        @damiankoper
      </a>
      | <a href="https://github.com/iszn11" target="_blank"> @iszn11 </a> |
      <a href="https://github.com/hergerr" target="_blank"> @hergerr </a> |
      <a href="https://github.com/matgwi96" target="_blank"> @matgwi96 </a>
    </span>
    <span class="love">Made with ❤️ & 🍺</span>
  </el-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  overflow: hidden;
  padding: 4px 8px;
  font-size: 16px;
  background: #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  position: relative;
  a {
    text-decoration: none;
    color: inherit;
  }
  .love {
    @media (max-width: 768px) {
      display: none;
    }
  }
}
</style>
