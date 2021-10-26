<template>
  <div>
    <el-drawer
      :model-value="visible"
      @close="$emit('update:visible', false)"
      direction="ltr"
      :size="480"
    >
      <template v-slot:title>
        <SmallTitle />
      </template>
      <h3>Wyniki wyszukiwania dla zaznaczonego obszaru:</h3>
      <div style="height: calc(100% - 48px)">
        <el-scrollbar always>
          <PublicationCard
            v-for="n in 10"
            :key="n"
            :publication="examplePublication"
          />
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Publication from "@/interfaces/Publication";
import { defineComponent } from "vue";
import PublicationCard from "./PublicationCard.vue";
import SmallTitle from "./SmallTitle.vue";

export default defineComponent({
  components: { PublicationCard, SmallTitle },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const examplePublication: Publication = {
      title: "Architektura komputerów",
      author: "Janusz Biernat",
      city: "Wrocław",
      year: 1998,
      isbn: "32198371928379812",
    };
    return {
      examplePublication,
    };
  },
});
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 0;
}
:deep(.el-drawer) {
  .el-drawer__body {
    overflow: hidden;
  }
}
</style>
