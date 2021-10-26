<template>
  <div class="search-container">
    <MenuBurger @click="this.formDialogVisible = !this.formDialogVisible" />
    <el-input
      v-model="input"
      placeholder="Szukaj miejsca"
      class="search-input"
    />
    <FormDrawer
      v-model:visible="formDialogVisible"
      @listDrawerToggled="toggleListDialogAction"
    />
    <ListDrawer v-model:visible="listDialogVisible" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FormDrawer from "./FormDrawer.vue";
import ListDrawer from "./ListDrawer.vue";
import MenuBurger from "./MenuBurger.vue";

export default defineComponent({
  components: { FormDrawer, ListDrawer, MenuBurger },
  setup() {
    const input = ref("");
    const formDialogVisible = ref(false);
    const listDialogVisible = ref(false);

    return {
      input,
      formDialogVisible,
      listDialogVisible,
    };
  },
  methods: {
    toggleFormDialogAction() {
      this.formDialogVisible = !this.formDialogVisible;
    },

    toggleListDialogAction() {
      this.listDialogVisible = !this.listDialogVisible;
    },
  },
});
</script>

<style lang="scss" scoped>
.search-container {
  display: flex;
  align-items: center;
  background-color: white;
  width: 300px;
  border-radius: 999px;
  padding: 4px 8px 4px 12px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}

.search-input {
  :deep(input) {
    border: none;
  }
}
</style>
