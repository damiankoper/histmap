<template>
  <el-container class="container">
    <div class="search-wrapper">
      <SearchInput />
    </div>
    <img src="../assets/images/map_placeholder.png" alt="placeholder" />
  </el-container>
  <div class="slider-wrapper">
    <TimelineSlider />
  </div>
  <Footer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Footer from "../components/Footer.vue";
import SearchInput from "../components/SearchInput.vue";
import TimelineSlider from "../components/TimelineSlider.vue";

export default defineComponent({
  components: { Footer, SearchInput, TimelineSlider },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 32px);

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

.slider-wrapper {
  position: absolute;
  width: 100%;
  bottom: 30px;
  z-index: 2;
}
</style>
