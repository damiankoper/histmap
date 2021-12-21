<template>
  <div
    class="timeline"
    justify="center"
    align="middle"
    v-loading="!globalStats"
  >
    <SliderAreaButton
      :showAreas="showAreas"
      @click="$emit('update:showAreas', !showAreas)"
    />
    <SliderTimeButton :byYear="byYear" @click="onTimeButtonClick" />
    <el-divider direction="vertical" />
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
      :model-value="yearInner"
      @update:model-value="(v) => $emit('update:year', v)"
      show-stops
      :min="globalStats?.tMin || 0"
      :max="globalStats?.tMax || 0"
      :show-tooltip="false"
      :step="1"
      height="80"
      class="slider"
      :disabled="!byYear"
    />
    <span v-if="year !== 0">
      {{ yearInner }}
    </span>
    <span v-else> --- </span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from "vue";
import SliderPlayButton from "../slider/SliderPlayButton.vue";
import SliderSpeedButton from "../slider/SliderSpeedButton.vue";
import SliderTimeButton from "../slider/SliderTimeButton.vue";
import SliderAreaButton from "../slider/SliderAreaButton.vue";
import { Speed, delaySettings } from "../../interfaces/Speed";
import { GlobalStats } from "@/interfaces/GlobalStats";
import { useKeypress } from "vue3-keypress";

export default defineComponent({
  components: {
    SliderPlayButton,
    SliderSpeedButton,
    SliderTimeButton,
    SliderAreaButton,
  },

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
    showAreas: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:showAreas", "update:year"],
  setup(props, { emit }) {
    const yearInner = ref(0);
    const byYear = ref(true);

    watchEffect(
      () => {
        if (byYear.value) yearInner.value = props.year;
      },
      { flush: "post" }
    );

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
      if (!byYear.value) emit("update:year", 0);
      else emit("update:year", yearInner.value);
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

  :deep(.el-divider--vertical) {
    height: 2em;
  }
}
</style>
