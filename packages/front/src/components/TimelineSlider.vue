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
      :min="YEARN_MIN"
      :max="YEAR_MAX"
      :show-tooltip="false"
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
import { Speed, SlowSpeed, NormalSpeed, FastSpeed } from "../interfaces/Speed";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const YEARN_MIN = 1900;
    const YEAR_MAX = 2021;

    const year = ref(YEARN_MIN);
    const isRunning = ref(false);
    const speed = ref<Speed>(SlowSpeed);

    const toggleIsRunning = () => {
      isRunning.value = !isRunning.value;
    };

    const changeSpeed = (currentSpeed: Speed) => {
      if (currentSpeed.description === SlowSpeed.description) {
        speed.value = NormalSpeed;
      } else if (currentSpeed.description === NormalSpeed.description) {
        speed.value = FastSpeed;
      } else {
        speed.value = SlowSpeed;
      }
    };

    // really dunno if it is legal to change timeout on the fly
    // it behaves diffrent, when speed is changed, when paused
    // and when speed is changed during sliding
    // console logs warnings, dunno if relevant, rather yes
    watchEffect(() => {
      if (isRunning.value && year.value < YEAR_MAX) {
        setTimeout(() => {
          year.value += 1;
        }, speed.value.delay);
      }
      if (isRunning.value && year.value === YEAR_MAX) {
        // stop running, change icon, go to start
        setTimeout(() => {
          toggleIsRunning();
          year.value = YEARN_MIN;
        }, 3000);
      }
    });

    return {
      YEARN_MIN,
      YEAR_MAX,
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
