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
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    type speed = "slow" | "normal" | "fast";
    const currentSpeed = ref<speed>("slow");
    console.log(currentSpeed.value);

    const handleClick = (param: speed) => {
      if (param === "slow") {
        currentSpeed.value = "normal";
      } else if (param === "normal") {
        currentSpeed.value = "fast";
      } else {
        currentSpeed.value = "slow";
      }
    };
    return {
      currentSpeed,
      handleClick,
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
