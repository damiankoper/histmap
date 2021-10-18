<template>
  <div class="search-container">
    <img
      src="../assets/images/burger.svg"
      alt="burger menu"
      @click="handleClick"
    />
    <el-input
      v-model="input"
      placeholder="Szukaj miejsca"
      class="search-input"
    />
    <FormDrawer />
    <ListDrawer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FormDrawer from "./FormDrawer.vue";
import ListDrawer from "./ListDraver.vue";
import store from "../utils/store";

export default defineComponent({
  components: { FormDrawer, ListDrawer },
  setup() {
    const input = ref("");

    const handleClick = () => {
      store.toggleFormDialogAction();
    };

    return {
      input,
      handleClick,
    };
  },
});
</script>

<style lang="scss">
@import "../assets/css/_variables.scss";

.search-container {
  display: flex;
  align-items: center;
  position: absolute;
  background-color: white;
  border-radius: 10px;
  width: 300px;
  border: 1px solid $a-grey;
  padding: 2px 30px 2px 10px;

  img {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }
}

.search-input {
  margin-left: 10px;
  input {
    height: 30px;
    border: none;
  }
}
</style>
