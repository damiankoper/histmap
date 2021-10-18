<template>
  <el-drawer
    v-model="store.state.showListDialog"
    title="HISTmap"
    direction="ltr"
  >
    <span class="subtitle"
      >Poniżej wyświetlono wyniki, znajdujące się na wybranym obszarze.</span
    >
    <!-- TODO make height somehow work -->
    <el-scrollbar always height="50%">
      <BookCard
        v-for="n in 10"
        :key="n"
        title="Architektura komputerów"
        author="Janusz Biernat"
        city="Wrocław"
        year="1998"
        isbn="32198371928379812"
      />
    </el-scrollbar>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "../utils/store";
import BookCard from "../components/BookCard.vue";

export default defineComponent({
  components: { BookCard },
  setup() {
    return {
      store,
    };
  },
});
</script>

<style lang="scss" scoped>
h3 {
  margin: 0;
}

.subtitle {
  display: block;
  margin-top: -20px;
  margin-bottom: 20px;
}
</style>
