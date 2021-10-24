<template>
  <div class="slider-button-wrapper" @click="handleClick(currentSpeed)">
    <div v-if="currentSpeed === 'slow'" class="icon-wrapper">
      <el-image
        class="icon-img"
        :src="require('../assets/images/snail.png')"
        alt="play icon"
      />
    </div>
    <div v-else-if="currentSpeed === 'normal'" class="icon-wrapper">
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
import { defineComponent, toRef } from "vue";
import Speed from "../interfaces/Speed";

export default defineComponent({
  props: {
    speed: {
      type: String,
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
