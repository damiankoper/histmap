<template>
  <el-drawer
    :model-value="visible"
    @close="$emit('update:visible', false)"
    direction="ltr"
    custom-class="drawer"
  >
    <template v-slot:title>
      <SmallTitle />
    </template>
    <div class="subtitle">
      Poniżej wyświetlono wyniki, znajdujące się na wybranym obszarze.
    </div>
    <!-- TODO make % height somehow work -->
    <el-scrollbar always height="500px">
      <PublicationCard
        v-for="n in 10"
        :key="n"
        :publication="examplePublication"
      />
    </el-scrollbar>
  </el-drawer>
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
.subtitle {
  margin-top: -20px;
  margin-bottom: 20px;
}
</style>
