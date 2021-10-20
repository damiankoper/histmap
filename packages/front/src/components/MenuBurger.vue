<template>
  <img
    src="../assets/images/burger.svg"
    alt="burger menu"
    @click="handleClick"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    toggleFormDialog: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const handleClick = () => {
      props.toggleFormDialog();
    };

    return { handleClick };
  },
});
</script>

<style lang="scss" scoped></style>
