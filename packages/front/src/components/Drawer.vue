<template>
  <el-drawer v-model="props.drawerVisible" title="HISTmap" direction="ltr">
    <div>
      <el-form :model="form">
        <el-form-item>
          <el-input v-model="form.place" placeholder="miejsce" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.author" placeholder="autor" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.year" placeholder="rok" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.title" placeholder="tytuł lub jego część" />
        </el-form-item>
      </el-form>

      <el-row justify="end">
        <el-button round :loading="loading">{{
          loading ? "Przetwarzanie..." : "Filtruj"
        }}</el-button>
      </el-row>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, PropType } from "vue";

export default defineComponent({
  props: {
    drawerVisible: {
      required: true,
      type: Boolean,
    },
    handleVisibility: {
      required: true,
      type: Function as PropType<() => void>,
    },
  },
  setup(props) {
    const state = reactive({
      loading: false,

      form: {
        place: "",
        author: "",
        year: "",
        title: "",
      },
    });

    const cancelForm = () => {
      state.loading = false;
      props.handleVisibility();
    };
    return { ...toRefs(state), cancelForm, props };
  },
});
</script>
