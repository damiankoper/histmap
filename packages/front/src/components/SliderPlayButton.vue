<template>
  <div class="slider-button-wrapper" @click="handleClick">
    <div v-if="isPlaying">
      <el-image
        class="icon-img"
        :src="require('../assets/images/pause.svg')"
        alt="play icon"
      />
    </div>
    <div v-else>
      <el-image
        class="icon-img"
        :src="require('../assets/images/play.svg')"
        alt="pause icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const isPlaying = ref(false);

    const handleClick = () => {
      isPlaying.value = !isPlaying.value;
    };

    return {
      isPlaying,
      handleClick,
    };
  },
});
</script>

<style lang="scss">
@import "../assets/scss/common.scss";
</style>
