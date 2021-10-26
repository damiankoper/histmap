<template>
  <el-container class="container" direction="vertical">
    <el-main style="flex-direction: column">
      <el-row :gutter="48" justify="center" align="middle">
        <el-col :span="18" :sm="12">
          <el-image
            fit="scale-down"
            :src="require('../assets/images/world_map.svg')"
            alt="World map"
          />
        </el-col>
        <el-col :sm="12">
          <h1>
            <span>HIST</span>
            <span>map</span>
          </h1>
        </el-col>
        <el-col :sm="24">
          <el-row justify="center" align="middle">
            <el-button round @click="handleClick">Rozpocznij</el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
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
  height: calc(100vh - 32px);
  background-color: #5e7d9a;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-main {
  min-width: 400px;
  max-width: 1000px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-col {
  margin: 8px 0;
}

h1 {
  margin: 0;
  font-size: 5rem;
  color: white;
  span:last-child {
    font-weight: 300;
  }

  @media (max-width: 768px) {
    text-align: center;
  }
}
</style>
