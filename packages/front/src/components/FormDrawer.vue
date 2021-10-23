<template>
  <el-drawer
    :model-value="visible"
    @close="$emit('update:visible', false)"
    direction="ltr"
    custom-class="drawer"
  >
    <template v-slot:title>
      <SmallTitle />
    </template>
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
import { defineComponent, reactive, ref, toRefs } from "vue";
import SmallTitle from "./SmallTitle.vue";

export default defineComponent({
  components: { SmallTitle },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["formDrawerToggled", "listDrawerToggled", "update:visible"],
  setup(props, { emit }) {
    const loading = ref(false);
    const form = reactive({
      form: {
        place: "",
        author: "",
        year: "",
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
    };
  },
});
</script>

<style lang="scss">
/* for both drawers */
.drawer {
  max-width: 500px;
}
</style>
