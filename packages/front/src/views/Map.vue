<template>
  <div class="container">
    <div class="search-wrapper">
      <SearchInput />
    </div>
    <img src="../assets/images/map_placeholder.png" alt="placeholder" />
  </div>
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
  height: 100%;
  width: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.search-wrapper {
  position: absolute;
  top: 10px;
  left: 10px;
}
</style>
