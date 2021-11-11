<template>
  <el-card shadow="hover" class="card">
    <h3>{{ pub.title }}</h3>
    <div>{{ pub.author }}</div>
    <div>{{ pub.city }} {{ pub.year }}</div>
    <div>ISBN {{ pub.isbn }}</div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Publication from "../../interfaces/Publication";

export default defineComponent({
  props: {
    publication: {
      type: Object as PropType<Publication>,
      required: true,
    },
  },
  setup(props) {
    return {
      pub: props.publication,
    };
  },
});
</script>

<style lang="scss" scoped>
.card {
  margin: 12px 12px 12px 0;

  div {
    margin-top: 12px;
  }
}
</style>
