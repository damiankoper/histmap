<template>
  <div>
    <el-drawer
      :model-value="visible"
      @close="onClose"
      direction="ltr"
      custom-class="drawer"
      :size="386"
    >
      <template v-slot:title>
        <SmallTitle />
      </template>
      <div>
        <h2>
          <span class="mdi-set mdi-book-search-outline"></span>
          Filtracja
        </h2>
        <hr style="margin: 12px 0" />

        <el-form label-width="70px">
          <el-form-item label="Tytul">
            <el-input
              v-model="titleInner"
              @keypress.enter="onSubmit"
              placeholder="Tytuł publikacji lub jego część"
            />
          </el-form-item>
          <el-form-item label="Miejsce">
            <el-input
              v-model="placeInner"
              @keypress.enter="onSubmit"
              placeholder="Miejsce publikacji"
            />
          </el-form-item>
          <el-form-item label="Autor">
            <el-input
              v-model="authorInner"
              @keypress.enter="onSubmit"
              placeholder="Autor publikacji"
            />
          </el-form-item>
        </el-form>

        <el-row justify="end">
          <el-button :loading="loading" @click="clearForm">
            Usuń filtry
          </el-button>
          <el-button type="primary" :loading="loading" @click="onSubmit">
            Filtruj
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
import { defineComponent, ref, watchEffect } from "vue";
import Help from "../others/Help.vue";
import SmallTitle from "../layout/SmallTitle.vue";

export default defineComponent({
  components: { SmallTitle, Help },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  emits: [
    "listDrawerToggled",
    "update:visible",
    "update:place",
    "update:author",
    "update:title",
  ],
  setup(props, { emit }) {
    const helpVisible = ref(false);
    const placeInner = ref("");
    const authorInner = ref("");
    const titleInner = ref("");

    const clearForm = () => {
      placeInner.value = "";
      authorInner.value = "";
      titleInner.value = "";
    };

    watchEffect(() => {
      placeInner.value = props.place;
      authorInner.value = props.author;
      titleInner.value = props.title;
    });

    const onSubmit = () => {
      emit("update:visible", false);
      emit("update:author", authorInner.value);
      emit("update:title", titleInner.value);
      emit("update:place", placeInner.value);
      emit("listDrawerToggled");
    };

    return {
      placeInner,
      authorInner,
      titleInner,
      clearForm,
      onSubmit,
      helpVisible,
      onClose() {
        placeInner.value = props.place;
        authorInner.value = props.author;
        titleInner.value = props.title;
        emit("update:visible", false);
      },
    };
  },
});
</script>
<style lang="scss" scoped>
h2 {
  margin-top: 0;
  margin-bottom: 0;
}
:deep(.el-drawer) {
  .el-drawer__body {
    flex-direction: column;
    display: flex;
    justify-content: space-between;
    padding-top: 0;
  }
}
</style>
