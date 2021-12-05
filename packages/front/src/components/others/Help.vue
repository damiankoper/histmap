<template>
  <el-dialog
    title="Pomoc"
    :model-value="modelValue"
    @close="$emit('update:modelValue', false)"
  >
    <el-scrollbar height="500px">
      <div class="markdown-body" v-html="help"></div>
    </el-scrollbar>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import help from "@/assets/md/help.md";

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    return { help };
  },
});
</script>

<style lang="scss" scoped>
.markdown-body :deep(p) {
  word-break: normal;
  text-align: justify;
}
</style>
