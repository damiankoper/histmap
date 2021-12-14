<template>
  <el-card shadow="hover" class="card">
    <h3>{{ publication.title }}</h3>
    <div style="margin-bottom: 4px">{{ publication.author }}</div>
    <div>{{ publication.publicationPlace }} {{ publication.year }}</div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Publication } from "pre-processor";

export default defineComponent({
  props: {
    publication: {
      type: Object as PropType<Publication>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.card {
  margin: 12px 12px 12px 0;

  :deep(.el-card__body) {
    padding: 12px;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 12px;
  }
}
</style>
