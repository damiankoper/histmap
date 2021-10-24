<template>
  <el-row class="timeline-bg" justify="center" align="middle">
    <el-row class="buttons-wrapper">
      <SliderPlayButton />
      <SliderSpeedButton />
    </el-row>
    <el-slider v-model="value" range show-stops :max="10" class="slider" />
  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SliderPlayButton from "./SliderPlayButton.vue";
import SliderSpeedButton from "./SliderSpeedButton.vue";

export default defineComponent({
  components: { SliderPlayButton, SliderSpeedButton },
  setup() {
    const value = ref([4, 8]);

    return {
      value,
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
