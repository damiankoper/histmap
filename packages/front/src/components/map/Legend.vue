<template>
  <el-popover
    placement="top-start"
    title="Wybierz paletę kolorów"
    trigger="click"
    width="350"
  >
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
              :style="{ background: defaultGradient }"
            ></div>
          </el-col>
        </el-row>
      </div>
    </template>
    <div>
      <div class="legend-container">
        <div
          class="gradient gradient-choice"
          :style="{ background: viridisGradient }"
        ></div>
        <div
          class="gradient gradient-choice"
          :style="{ background: heatGradient }"
        ></div>
        <div
          class="gradient gradient-choice"
          :style="{ background: magmaGradient }"
        ></div>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts">
import useApi from "@/composables/useApi";
import { defineComponent, onMounted, watch } from "vue";
import { TileStats } from "pre-processor";
import { SingleColorData, GradientData, gradients } from "api";

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
  },
  setup(props) {
    const { fetch, data } = useApi<TileStats>(
      () => `tiles/stats/${props.year}/${props.zoom}`
    );
    const createGradient = (gradient: GradientData) => {
      const parts: string[] = [];
      gradient.colors.forEach((p: SingleColorData) => {
        parts.push(`${p.color} ${p.pos * 100}%`);
      });
      return `linear-gradient(to right,${parts.join(", ")})`;
    };

    const defaultGradientData: GradientData = { colors: gradients.default };
    const viridisGradientData: GradientData = { colors: gradients.viridis };
    const heatGradientData: GradientData = { colors: gradients.heat };
    const magmaGradientData: GradientData = { colors: gradients.magma };

    const defaultGradient = createGradient(defaultGradientData);
    const viridisGradient = createGradient(viridisGradientData);
    const heatGradient = createGradient(heatGradientData);
    const magmaGradient = createGradient(magmaGradientData);

    onMounted(fetch);
    watch(props, fetch);
    return {
      data,
      defaultGradient,
      viridisGradient,
      heatGradient,
      magmaGradient,
    };
  },
});
</script>

<style lang="scss">
.el-popover {
  padding: 0 !important;
}

.el-popover__title {
  padding: 8px 8px 0 8px;
  font-size: 20px;
  margin-bottom: 0;
}

.legend-container {
  padding: 12px;
  line-height: 1em;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  width: 350px;
  box-sizing: border-box;

  .gradient {
    height: 1em;
    width: 100%;
    border-radius: 4px;
    margin-top: 4px;
  }

  .gradient-choice {
    margin: 20px 0;
  }
}
</style>
