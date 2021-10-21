<template>
  <el-image
    :src="require('../assets/images/burger.svg')"
    alt="burger menu"
    @click="handleClick"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["formDrawerToggled"],
  setup(props, { emit }) {
    const handleClick = () => {
      emit("formDrawerToggled");
    };
    return { handleClick };
  },
});
</script>

<style lang="scss" scoped></style>
