<template>
  <div class="search-container">
    <div class="search-input">
      <MenuBurger @click="$emit('click')" />
      <el-input v-model="input" placeholder="Szukaj miejsca" />
    </div>
    <!-- TODO: 
      when location is emitted next to input appears circle button with X icon
      when clicked location = null is emited and input is cleared 
    -->

    <!-- TODO: v-for for reults -->
    <div>Result 1</div>
    <div>Result 2</div>
    <div>Result 3</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import MenuBurger from "../layout/MenuBurger.vue";
import _ from "lodash";
import { MapSearchResult } from "@/composables/useMap";
export default defineComponent({
  components: { MenuBurger },
  props: {
    modelValue: { type: String, default: "" },
  },
  emits: ["location", "click"],
  setup(props, { emit }) {
    const input = ref("");

    watch(
      input,
      _.debounce(async () => {
        /**
         * TODO: geocoding entrypoint
         * 1. request to geocoding API e.g. https://docs.mapbox.com/playground/geocoding/?search_text=wroclaw
         * 2. get results and display list below input for user to select
         * 3. when input selected emit 'location' event with payload of MapSearchResults interface from useMap
         */
      }, 500)
    );

    return {
      input,
    };
  },
});
</script>

<style lang="scss" scoped>
.search-container {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);

  .search-input {
    display: flex;
    align-items: center;
    width: 300px;
    border-radius: 24px;
    padding: 4px 8px 4px 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  }
}
.el-input {
  :deep(input) {
    border: none;
  }
}
</style>
