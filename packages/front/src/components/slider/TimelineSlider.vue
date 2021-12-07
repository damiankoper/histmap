<template>
  <div
    class="timeline"
    justify="center"
    align="middle"
    v-loading="!globalStats"
  >
    <SliderTimeButton :byYear="byYear" @click="onTimeButtonClick" />
    <SliderSpeedButton
      :speed="speed"
      @click="onSpeedButtonClick"
      :disabled="!byYear"
    />
    <SliderPlayButton
      :isPlaying="isPlaying"
      @click="toggleIsPlaying"
      :disabled="!byYear"
    />
    <el-slider
      v-model="yearInner"
      show-stops
      :min="globalStats?.tMin || 0"
      :max="globalStats?.tMax || 0"
      :show-tooltip="false"
      :step="1"
      height="80"
      class="slider"
      :disabled="!byYear"
    />
    <span v-if="globalStats">
      {{ year }}
    </span>
    <span v-else> --- </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from "vue";
import SliderPlayButton from "../slider/SliderPlayButton.vue";
import SliderSpeedButton from "../slider/SliderSpeedButton.vue";
import SliderTimeButton from "../slider/SliderTimeButton.vue";
import { Speed, delaySettings } from "../../interfaces/Speed";
import { GlobalStats } from "@/interfaces/GlobalStats";
import { useKeypress } from "vue3-keypress";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton, SliderTimeButton },

  props: {
    globalStats: {
      type: Object as PropType<GlobalStats | null>,
    },
    year: { type: Number, default: 0 },
    formDialogVisible: {
      type: Boolean,
      required: true,
    },
    listDialogVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["byYear", "update:year"],
  setup(props, { emit }) {
    const yearInner = ref(0);

    watchEffect(() => {
      yearInner.value = props.year;
    });

    watchEffect(() => {
      emit("update:year", yearInner.value);
    });

    useKeypress({
      keyEvent: "keydown",
      keyBinds: [
        {
          keyCode: "space",
          success: () => {
            if (
              !props.formDialogVisible &&
              !props.listDialogVisible &&
              byYear.value
            ) {
              toggleIsPlaying();
            }
          },
        },
      ],
    });

    const isPlaying = ref(false);
    const speed = ref<Speed>(Speed.SLOW);
    const delay = ref(delaySettings[Speed.SLOW]);
    const byYear = ref(true);
    let playInterval: ReturnType<typeof setInterval>;

    function setPlayingInterval() {
      clearInterval(playInterval);
      playInterval = setInterval(() => {
        if (props.globalStats)
          yearInner.value =
            yearInner.value < props.globalStats.tMax
              ? yearInner.value + 1
              : props.globalStats.tMin;
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

    function onTimeButtonClick() {
      byYear.value = !byYear.value;
      emit("byYear", byYear.value);
      if (isPlaying.value) {
        toggleIsPlaying();
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
      yearInner,
      speed,
      byYear,
      isPlaying,
      onTimeButtonClick,
      onSpeedButtonClick,
      toggleIsPlaying,
    };
  },
});
</script>

<style lang="scss" scoped>
.timeline {
  background-color: white;
  box-shadow: 0 -2px 4px rgb(0 0 0 / 30%);

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 48px;
  z-index: 2;
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
