<template>
  <div class="timeline" justify="center" align="middle">
    <SliderSpeedButton :speed="speed" @click="onSpeedButtonClick" />
    <SliderPlayButton :isPlaying="isPlaying" @click="toggleIsPlaying" />
    <el-slider
      v-model="year"
      show-stops
      :min="YEAR_MIN"
      :max="YEAR_MAX"
      :show-tooltip="false"
      :step="1"
      height="80"
      class="slider"
    />
    <span>
      {{ year }}
    </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import SliderPlayButton from "../slider/SliderPlayButton.vue";
import SliderSpeedButton from "../slider/SliderSpeedButton.vue";
import { Speed, delaySettings } from "../../interfaces/Speed";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const YEAR_MIN = 1900;
    const YEAR_MAX = 2021;

    const year = ref(YEAR_MIN);
    const isPlaying = ref(false);
    const speed = ref<Speed>(Speed.SLOW);
    const delay = ref(delaySettings[Speed.SLOW]);
    let playInterval: ReturnType<typeof setInterval>;

    function setPlayingInterval() {
      clearInterval(playInterval);
      playInterval = setInterval(() => {
        year.value = year.value < YEAR_MAX ? year.value + 1 : YEAR_MIN;
      }, delay.value);
    }

    function toggleIsPlaying() {
      isPlaying.value = !isPlaying.value;
      if (isPlaying.value) {
        setPlayingInterval();
      } else {
        clearInterval(playInterval);
      }
    }

    const nextSpeed = computed(() => {
      switch (speed.value) {
        default:
        case Speed.SLOW:
          return Speed.NORMAL;
        case Speed.NORMAL:
          return Speed.FAST;
        case Speed.FAST:
          return Speed.SLOW;
      }
    });

    function onSpeedButtonClick() {
      speed.value = nextSpeed.value;
      delay.value = delaySettings[speed.value];
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
      onSpeedButtonClick,
      toggleIsPlaying,
    };
  },
});
</script>

<style lang="scss" scoped>
.timeline {
  background-color: white;
  box-shadow: 0 2px 4px rgb(0 0 0 / 30%);

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 48px;
  z-index: 1;
  position: relative;

  .slider {
    flex: 1;
    margin: 0 48px;
  }
  span {
    font-size: 2rem;
    font-weight: 700;
  }
}
</style>
