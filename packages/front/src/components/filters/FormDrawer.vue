<template>
  <div>
    <el-drawer
      :model-value="visible"
      @close="$emit('update:visible', false)"
      direction="ltr"
      custom-class="drawer"
      :size="386"
    >
      <template v-slot:title>
        <SmallTitle />
      </template>
      <div>
        <h2 style="margin-top: 0">Filtracja</h2>
        <el-form :model="form" label-width="70px">
          <el-form-item label="Tytul">
            <el-input
              v-model="form.title"
              placeholder="Tytuł publikacji lub jego część"
            />
          </el-form-item>
          <el-form-item label="Miejsce">
            <el-input v-model="form.place" placeholder="Miejsce publikacji" />
          </el-form-item>
          <el-form-item label="Autor">
            <el-input v-model="form.author" placeholder="Autor publikacji" />
          </el-form-item>
        </el-form>

        <el-row justify="end">
          <el-button round :loading="loading" @click="onSubmit">
            {{ loading ? "Ładowanie..." : "Filtruj" }}
          </el-button>
        </el-row>
      </div>
      <el-row justify="end">
        <el-button
          @click="helpVisible = true"
          circle
          type="primary"
          title="Pokaż pomoc"
        >
          <i class="mdi-set mdi-help"></i>
        </el-button>
        <help v-model="helpVisible" />
      </el-row>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from "vue";
import Help from "../others/Help.vue";
import SmallTitle from "../layout/SmallTitle.vue";

export default defineComponent({
  components: { SmallTitle, Help },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["formDrawerToggled", "listDrawerToggled", "update:visible"],
  setup(props, { emit }) {
    const loading = ref(false);
    const helpVisible = ref(false);
    const form = reactive({
      form: {
        place: "",
        author: "",
        title: "",
      },
    });

    const cancelForm = () => {
      loading.value = false;
    };

    const onSubmit = () => {
      emit("update:visible", false);
      emit("listDrawerToggled");
    };

    return {
      loading,
      ...toRefs(form),
      cancelForm,
      onSubmit,
      helpVisible,
    };
  },
});
</script>
<style lang="scss" scoped>
:deep(.el-drawer) {
  .el-drawer__body {
    flex-direction: column;
    display: flex;
    justify-content: space-between;
  }
}
</style>
