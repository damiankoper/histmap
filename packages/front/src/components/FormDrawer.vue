<template>
  <el-drawer v-model="showDrawer" direction="ltr" custom-class="drawer">
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
import { computed, defineComponent, reactive, toRef, toRefs } from "vue";
import SmallTitle from "./SmallTitle.vue";

export default defineComponent({
  components: { SmallTitle },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["formDrawerToggled", "listDrawerToggled"],
  setup(props, { emit }) {
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
      emit("formDrawerToggled");
      emit("listDrawerToggled");
    };

    return {
      showDrawer: toRef(props, "visible"),
      ...toRefs(state),
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
