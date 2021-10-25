<template>
  <el-row class="timeline-bg" justify="center" align="middle">
    <el-row class="buttons-wrapper">
      <SliderSpeedButton :speed="speed" @changeSpeed="changeSpeed" />
      <SliderPlayButton
        :isRunning="isRunning"
        @negateIsRunning="toggleIsRunning"
      />
    </el-row>
    <el-slider
      v-model="year"
      show-stops
      :min="1900"
      :max="2021"
      :step="1"
      class="slider"
    />
    <span>
      {{ year }}
    </span>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from "vue";
import SliderPlayButton from "./SliderPlayButton.vue";
import SliderSpeedButton from "./SliderSpeedButton.vue";
import Speed from "../interfaces/Speed";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const year = ref(1900);
    const isRunning = ref(false);
    const speed = ref<Speed>("slow");
    const delay = ref(1000);

    const toggleIsRunning = () => {
      isRunning.value = !isRunning.value;
    };

    const changeSpeed = (currentSpeed: Speed) => {
      if (currentSpeed === "slow") {
        speed.value = "normal";
        delay.value = 500;
      } else if (currentSpeed === "normal") {
        speed.value = "fast";
        delay.value = 300;
      } else {
        speed.value = "slow";
        delay.value = 1000;
      }
    };

    watchEffect(() => {
      // year not needed in condition, but otherwise is not deteted as dependency
      if (isRunning.value && year.value) {
        setTimeout(() => {
          year.value += 1;
        }, delay.value);
      }
    });

    return {
      year,
      speed,
      isRunning,
      changeSpeed,
      toggleIsRunning,
    };
  },
});
</script>

<style lang="scss" scoped>
.timeline-bg {
  background-color: white;

  span {
    margin-left: 30px;
  }
}
.slider {
  width: 50%;
}
</style>
