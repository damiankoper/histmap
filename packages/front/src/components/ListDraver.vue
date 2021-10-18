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
    <el-scrollbar always height="50%" wrap-class="lol">
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
      <el-card shadow="hover" class="card">
        <h3>Architektura komputerów</h3>
        <span class="card-info">Janusz Biernat</span>
        <span class="card-info">Wrocław 1998</span>
        <span class="card-info">ISBN 12389743829798234</span>
      </el-card>
    </el-scrollbar>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "../utils/store";

export default defineComponent({
  setup() {
    return {
      store,
    };
  },
});
</script>

<style lang="scss" scoped>
.card {
  margin: 10px 10px 10px 0;
}
h3 {
  margin: 0;
}
.card-info {
  display: block;
  margin-top: 10px;
}

.subtitle {
  display: block;
  margin-top: -20px;
  margin-bottom: 20px;
}
</style>
