<template>
  <el-container class="container">
    <div class="search-wrapper">
      <SearchInput />
    </div>
    <img src="../assets/images/map_placeholder.png" alt="placeholder" />
  </el-container>
  <Footer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Footer from "../components/Footer.vue";
import SearchInput from "../components/SearchInput.vue";

export default defineComponent({
  components: { Footer, SearchInput },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 16px);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.search-wrapper {
  position: absolute;
  top: 8px;
  left: 8px;
}
</style>
