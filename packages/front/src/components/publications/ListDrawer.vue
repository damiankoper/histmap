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
      <div style="height: calc(100% - 48px)" v-loading="loading">
        <div v-if="error" class="error-msg">
          Brak wyników wyszukiwania. Proszę wybrać inny obszar, a jeśli problem
          będzie występował w miejscach z publikacjami, proszę skontaktować się
          z pomocą techniczną.
        </div>
        <el-scrollbar always v-else>
          <PublicationCard
            v-for="publication in publications"
            :key="publication.isbn"
            :publication="publication"
          />
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Publication from "@/interfaces/Publication";
import { defineComponent, PropType } from "vue";
import PublicationCard from "./PublicationCard.vue";
import SmallTitle from "../layout/SmallTitle.vue";

export default defineComponent({
  components: { PublicationCard, SmallTitle },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    publications: {
      type: Array as PropType<Array<Publication>>,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 0;
}
.error-msg {
  width: 90%;
  text-align: justify;
  line-height: 1.5;
}
:deep(.el-drawer) {
  .el-drawer__body {
    overflow: hidden;
  }
}
</style>
