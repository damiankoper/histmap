<template>
  <el-button
    @click="$emit('click')"
    type="primary"
    circle
    style="font-size: 1.5rem; padding: 8px"
    title="Odtwarzaj w czasie"
  >
    <i class="mdi-set mdi-pause" v-if="isPlaying"></i>
    <i class="mdi-set mdi-play" v-else></i>
  </el-button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isPlaying: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["click"],
});
</script>
