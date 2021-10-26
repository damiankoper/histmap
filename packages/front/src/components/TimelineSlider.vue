<template>
  <el-row class="timeline-bg" justify="center" align="middle">
    <el-row class="buttons-wrapper">
      <SliderSpeedButton :speed="speed" @changeSpeed="changeSpeed" />
      <SliderPlayButton :isPlaying="isPlaying" @click="toggleIsPlaying" />
    </el-row>
    <el-slider
      v-model="year"
      show-stops
      :min="YEAR_MIN"
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
import { defineComponent, ref } from "vue";
import SliderPlayButton from "./SliderPlayButton.vue";
import SliderSpeedButton from "./SliderSpeedButton.vue";
import { Speed, SlowSpeed, NormalSpeed, FastSpeed } from "../interfaces/Speed";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const YEAR_MIN = 1900;
    const YEAR_MAX = 2021;

    const year = ref(YEAR_MIN);
    const isPlaying = ref(false);
    const speed = ref<Speed>(SlowSpeed);
    let playInterval: ReturnType<typeof setInterval>;

    function setPlayingInterval() {
      clearInterval(playInterval);
      playInterval = setInterval(() => {
        year.value = year.value < YEAR_MAX ? year.value + 1 : YEAR_MIN;
      }, speed.value.delay);
    }

    function toggleIsPlaying() {
      isPlaying.value = !isPlaying.value;
      if (isPlaying.value) {
        setPlayingInterval();
      } else {
        clearInterval(playInterval);
      }
    }

    function changeSpeed(currentSpeed: Speed) {
      if (currentSpeed.description === SlowSpeed.description) {
        speed.value = NormalSpeed;
      } else if (currentSpeed.description === NormalSpeed.description) {
        speed.value = FastSpeed;
      } else {
        speed.value = SlowSpeed;
      }
      if (isPlaying.value) {
        setPlayingInterval();
      }
    }

    return {
      YEAR_MIN,
      YEAR_MAX,
      year,
      speed,
      isPlaying,
      changeSpeed,
      toggleIsPlaying,
    };
  },
});
</script>

<style lang="scss" scoped>
.timeline-bg {
  background-color: #ffffffbb;

  span {
    margin-left: 32px;
  }
}
.slider {
  width: 50%;
}
</style>
