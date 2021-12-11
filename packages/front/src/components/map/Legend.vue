<template>
  <el-popover
    placement="top-start"
    title="Wybierz paletę kolorów"
    trigger="hover"
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
              :style="{ background: choosenGradient.color }"
            ></div>
          </el-col>
        </el-row>
      </div>
    </template>
    <div>
      <div class="legend-container">
        <div
          class="gradient gradient-choice"
          @click="setGradient(defaultGradient)"
          :style="{ background: defaultGradient.color }"
        ></div>
        <div
          class="gradient gradient-choice"
          @click="setGradient(viridisGradient)"
          :style="{ background: viridisGradient.color }"
        ></div>
        <div
          class="gradient gradient-choice"
          @click="setGradient(heatGradient)"
          :style="{ background: heatGradient.color }"
        ></div>
        <div
          class="gradient gradient-choice"
          @click="setGradient(magmaGradient)"
          :style="{ background: magmaGradient.color }"
        ></div>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts">
import useApi from "@/composables/useApi";
import { defineComponent, onMounted, ref, watch } from "vue";
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
  },
  emits: ["gradientChanged"],
  setup(props, { emit }) {
    const { fetch, data } = useApi<TileStats>(
      () => `tiles/stats/${props.year}/${props.zoom}`
    );

    const { defaultGradient, viridisGradient, heatGradient, magmaGradient } =
      useGradients();

    const choosenGradient = ref<Gradient>(defaultGradient);

    const setGradient = (gradient: Gradient) => {
      choosenGradient.value = gradient;
      emit("gradientChanged", choosenGradient.value);
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

<style lang="scss">
.el-popover {
  padding: 0 !important;
}

.el-popover__title {
  padding: 8px 8px 0 8px;
  margin-bottom: 0 !important;
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
    cursor: pointer;
  }
}
</style>
