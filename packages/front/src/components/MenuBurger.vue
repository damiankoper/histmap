<template>
  <img
    src="../assets/images/burger.svg"
    alt="burger menu"
    @click="handleClick"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "../utils/store";

export default defineComponent({
  setup() {
    const handleClick = () => {
      store.toggleFormDialogAction();
    };

    return { handleClick };
  },
});
</script>

<style lang="scss" scoped></style>
