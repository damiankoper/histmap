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
            <div class="gradient" :style="{ background: gradient }"></div>
          </el-col>
        </el-row>
      </div>
    </template>
    <div>
      <div class="legend-container">
        <div
          class="gradient gradient-choice"
          :style="{ background: gradient }"
        ></div>
        <div
          class="gradient gradient-choice"
          :style="{ background: gradient }"
        ></div>
        <div
          class="gradient gradient-choice"
          :style="{ background: gradient }"
        ></div>
        <div
          class="gradient gradient-choice"
          :style="{ background: gradient }"
        ></div>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts">
import useApi from "@/composables/useApi";
import { defineComponent, onMounted, computed, watch } from "vue";
import { TileStats } from "pre-processor";
// import { gradients } from "api";

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
    const gradient = [
      { pos: 0.0, color: "blue" },
      { pos: 0.4, color: "blue" },
      { pos: 0.6, color: "cyan" },
      { pos: 0.7, color: "lime" },
      { pos: 0.8, color: "yellow" },
      { pos: 1.0, color: "red" },
    ];
    onMounted(fetch);
    watch(props, fetch);
    return {
      data,
      gradient: computed(() => {
        const parts: string[] = [];
        gradient.forEach((p) => {
          parts.push(`${p.color} ${p.pos * 100}%`);
        });
        return `linear-gradient(to right,${parts.join(", ")})`;
      }),
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
