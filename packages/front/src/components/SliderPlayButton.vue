<template>
  <div class="slider-button-wrapper" @click="handleClick">
    <div v-if="showRunningIcon">
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
import { defineComponent, toRef } from "vue";

export default defineComponent({
  props: {
    isRunning: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["negateIsRunning"],
  setup(props, { emit }) {
    const handleClick = () => {
      emit("negateIsRunning");
    };

    return {
      handleClick,
      showRunningIcon: toRef(props, "isRunning"),
    };
  },
});
</script>

<style lang="scss">
@import "../assets/scss/common.scss";
</style>
