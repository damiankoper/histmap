<template>
  <el-row class="timeline-bg" justify="center" align="middle">
    <el-row class="buttons-wrapper">
      <SliderSpeedButton />
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
    {{ year }}
  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from "vue";
import SliderPlayButton from "./SliderPlayButton.vue";
import SliderSpeedButton from "./SliderSpeedButton.vue";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const year = ref(1900);
    const isRunning = ref(false);

    const toggleIsRunning = () => {
      isRunning.value = !isRunning.value;
    };

    watchEffect(() => {
      // year not needed in condition, but otherwise is not deteted as dependency
      if (isRunning.value && year.value) {
        setTimeout(() => {
          year.value += 1;
        }, 100);
      }
    });

    return {
      year,
      isRunning,
      toggleIsRunning,
    };
  },
});
</script>

<style lang="scss" scoped>
.timeline-bg {
  background-color: white;
}
.slider {
  width: 50%;
}
</style>
