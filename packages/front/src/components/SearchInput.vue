<template>
  <div class="search-container">
    <MenuBurger />
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
import MenuBurger from "./MenuBurger.vue";

export default defineComponent({
  components: { FormDrawer, ListDrawer, MenuBurger },
  setup() {
    const input = ref("");

    return {
      input,
    };
  },
});
</script>

<style lang="scss">
.search-container {
  display: flex;
  -webkit-appearance: none;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  width: 300px;
  border: 1px solid #dcdfe6;
  padding: 4px 32px 4px 8px;
  height: 40px;
  outline: none;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    border-color: #c0c4cc;
  }

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
