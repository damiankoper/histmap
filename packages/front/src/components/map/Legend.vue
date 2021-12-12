<template>
  <el-popover placement="top-start" trigger="hover" :width="350 - 24">
    <template #reference>
      <div class="legend-container">
        <el-row justify="space-between">
          <el-col :span="6"> 0 </el-col>
          <el-col :span="10" style="text-align: center">
            Liczba publikacji
          </el-col>
          <el-col :span="6" style="text-align: right">
            <div v-if="data">
              {{ data.max }}
            </div>
          </el-col>
          <el-col :span="24">
            <div
              class="gradient"
              :style="{ background: choosenGradient.color }"
            ></div>
          </el-col>
        </el-row>
      </div>
    </template>
    <div>
      <div class="title">Wybierz paletę kolorów</div>
      <div
        class="gradient gradient-choice"
        @click="setGradient(defaultGradient)"
        :style="{ background: defaultGradient.color, color: 'white' }"
      >
        Default
      </div>
      <div
        class="gradient gradient-choice"
        @click="setGradient(viridisGradient)"
        :style="{ background: viridisGradient.color }"
      >
        Viridis
      </div>
      <div
        class="gradient gradient-choice"
        @click="setGradient(heatGradient)"
        :style="{ background: heatGradient.color }"
      >
        Heat
      </div>
      <div
        class="gradient gradient-choice"
        @click="setGradient(magmaGradient)"
        :style="{ background: magmaGradient.color }"
      >
        Magma
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts">
import useApi from "@/composables/useApi";
import { defineComponent, onMounted, PropType, ref, watch } from "vue";
import { TileStats } from "pre-processor";
import { useGradients } from "../../composables/useGradients";
import { Gradient } from "api";

export default defineComponent({
  props: {
    year: {
      type: Number,
      default: 0,
    },
    zoom: {
      type: Number,
      default: 0,
    },
    gradient: {
      type: Object as PropType<Gradient>,
      required: true,
    },
  },
  emits: ["update:gradient"],
  setup(props, { emit }) {
    const { fetch, data } = useApi<TileStats>(
      () => `tiles/stats/${props.year}/${props.zoom}`
    );

    const { defaultGradient, viridisGradient, heatGradient, magmaGradient } =
      useGradients();

    const choosenGradient = ref<Gradient>(defaultGradient);

    const setGradient = (gradient: Gradient) => {
      choosenGradient.value = gradient;
      emit("update:gradient", choosenGradient.value);
    };

    onMounted(fetch);
    watch(props, fetch);
    return {
      data,
      setGradient,
      defaultGradient,
      viridisGradient,
      heatGradient,
      magmaGradient,
      choosenGradient,
    };
  },
});
</script>

<style scoped lang="scss">
.legend-container {
  padding: 12px;
  line-height: 1em;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  width: 350px;
  box-sizing: border-box;
}

.title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: bold;
}

.gradient {
  height: 1em;
  width: 100%;
  border-radius: 4px;
  margin-top: 4px;

  &-choice {
    color: var(--el-text-color-primary);
    font-weight: bold;
    box-sizing: border-box;
    margin-top: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 1.5em;
    padding: 0 8px;
  }
}
</style>
