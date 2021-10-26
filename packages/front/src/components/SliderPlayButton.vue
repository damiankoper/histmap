<template>
  <div class="slider-button-wrapper" @click="$emit('click')">
    <el-button type="primary" circle>
      <el-image
        v-if="isPlaying"
        class="icon-img"
        :src="require('../assets/images/pause.svg')"
        alt="play icon"
      />
      <el-image
        v-else
        class="icon-img"
        :src="require('../assets/images/play.svg')"
        alt="pause icon"
      />
    </el-button>
  </div>
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
