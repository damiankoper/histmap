<template>
  <el-container class="container">
    <el-row />
    <div class="wrapper">
      <el-row justify="center">
        <el-image
          :src="require('../assets/images/world_map.svg')"
          alt="world map"
          class="world-map"
        />
        <h1>HISTmap</h1>
      </el-row>
      <el-row justify="center" class="custom-row">
        <el-button round @click="handleClick">Rozpocznij</el-button>
      </el-row>
    </div>
  </el-container>
  <Footer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import Footer from "../components/Footer.vue";

export default defineComponent({
  components: { Footer },
  setup() {
    const router = useRouter();
    const handleClick = () => {
      router.push({ name: "Map" });
    };

    return { handleClick };
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 16px);
  background-color: #5e7d9a;
}

/* no justify/align for el-col */
.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}

.world-map {
  width: 200px;
}

h1 {
  letter-spacing: 40px;
  font-size: 96px;
  font-weight: 400;
  margin-left: 120px;
  color: white;
}

.custom-row {
  margin-top: 100px;
}
</style>
