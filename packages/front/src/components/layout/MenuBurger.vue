<template>
  <i
    class="mdi-set mdi-menu"
    style="font-size: 2rem; cursor: pointer"
    @click="$emit('click')"
  ></i>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["click"],
});
</script>
