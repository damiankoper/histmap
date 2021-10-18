<template>
  <el-card shadow="hover" class="card">
    <h3>{{ props.title }}</h3>
    <span>{{ props.author }}</span>
    <span>{{ props.city }} {{ props.year }}</span>
    <span>ISBN {{ props.isbn }}</span>
  </el-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      required: true,
      type: String,
    },
    author: {
      required: false,
      type: String,
    },
    city: {
      type: String,
    },
    year: {
      type: Number,
    },
    isbn: {
      type: String,
    },
  },
  setup(props) {
    return {
      props,
    };
  },
});
</script>

<style lang="scss" scoped>
.card {
  margin: 10px 10px 10px 0;

  span {
    display: block;
    margin-top: 10px;
  }
}
</style>
