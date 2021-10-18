<template>
  <el-drawer
    v-model="store.state.showListDialog"
    title="Poniżej wyświetlono wyniki, znajdujące się na wybranym obszarze."
    direction="ltr"
  >
    <span>test test</span>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "../utils/store";

export default defineComponent({
  setup() {
    return {
      store,
    };
  },
});
</script>
