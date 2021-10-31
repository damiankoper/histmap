<template>
  <el-button
    type="primary"
    circle
    style="font-size: 1.5rem; padding: 8px; min-height: initial"
    @click="$emit('click')"
    title="Zmień prędkość"
  >
    <i class="mdi-set" :class="icon"></i>
  </el-button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Speed } from "../../interfaces/Speed";

export default defineComponent({
  props: {
    speed: {
      type: Object as PropType<Speed>,
      required: true,
    },
  },
  emits: ["click"],
  setup(props) {
    return {
      icon: computed(() => {
        switch (props.speed) {
          default:
          case Speed.SLOW:
            return "mdi-snail";
          case Speed.NORMAL:
            return "mdi-walk";
          case Speed.FAST:
            return "mdi-unicorn";
        }
      }),
    };
  },
});
</script>
