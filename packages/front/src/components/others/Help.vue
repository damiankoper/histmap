<template>
  <el-dialog
    title="Pomoc"
    :model-value="modelValue"
    @close="$emit('update:modelValue', false)"
  >
    <div class="markdown-body" v-html="help"></div>
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

<style lang="scss" scoped></style>
