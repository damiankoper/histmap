<template>
  <div class="slider-button-wrapper" @click="handleClick(currentSpeed)">
    <div
      v-if="currentSpeed.description === SlowSpeed.description"
      class="icon-wrapper"
    >
      <el-image
        class="icon-img"
        :src="require('../assets/images/snail.png')"
        alt="play icon"
      />
    </div>
    <div
      v-else-if="currentSpeed.description === NormalSpeed.description"
      class="icon-wrapper"
    >
      <el-image
        class="icon-img"
        :src="require('../assets/images/human.png')"
        alt="pause icon"
      />
    </div>
    <div v-else class="icon-wrapper">
      <el-image
        class="icon-img"
        :src="require('../assets/images/cheetah.png')"
        alt="pause icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from "vue";
import { Speed, SlowSpeed, NormalSpeed } from "../interfaces/Speed";

export default defineComponent({
  props: {
    speed: {
      type: Object as PropType<Speed>,
      required: true,
    },
  },
  emits: ["changeSpeed"],
  setup(props, { emit }) {
    const handleClick = (param: Speed) => {
      emit("changeSpeed", param);
    };

    return {
      handleClick,
      currentSpeed: toRef(props, "speed"),
      SlowSpeed,
      NormalSpeed,
    };
  },
});
</script>

<style lang="scss">
@import "../assets/scss/common.scss";

.test {
  width: 30px;
}
</style>
