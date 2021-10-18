<template>
  <el-drawer
    v-model="store.state.showFormDialog"
    title="HISTmap"
    direction="ltr"
  >
    <div>
      <el-form :model="form">
        <el-form-item>
          <el-input v-model="form.place" placeholder="miejsce" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.author" placeholder="autor" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.year"
            type="number"
            min="0"
            placeholder="rok"
          />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.title" placeholder="tytuł lub jego część" />
        </el-form-item>
      </el-form>

      <el-row justify="end">
        <el-button round :loading="loading" @click="onSubmit"
          >{{ loading ? "Przetwarzanie..." : "Filtruj" }}
        </el-button>
      </el-row>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
import store from "../utils/store";

export default defineComponent({
  setup() {
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
    };

    const onSubmit = () => {
      store.toggleFormDialogAction();
      store.toggleListDialogAction();
    };

    return { ...toRefs(state), cancelForm, store, onSubmit };
  },
});
</script>
