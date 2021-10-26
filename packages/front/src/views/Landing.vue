<template>
  <el-container class="container">
    <el-main>
      <el-row :gutter="0" justify="center" align="middle">
        <el-col :span="24" :sm="12">
          <el-image
            :src="require('../assets/images/world_map_light.svg')"
            alt="World map"
          />
        </el-col>
        <el-col :span="24" :sm="12">
          <h1>
            <span>HIST</span>
            <span>map</span>
          </h1>
          <el-button type="default" round @click="handleClick">
            Rozpocznij
          </el-button>
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
  background: rgb(110, 226, 245);
  background: linear-gradient(
    147deg,
    rgba(110, 226, 245, 1) 0%,
    rgba(102, 68, 240, 1) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-image {
  width: 256px;
}

.el-main {
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex: 1;
}

.el-col {
  margin: 8px 0;
  @media (max-width: 768px) {
    text-align: center;
  }
}

h1 {
  margin: 0;
  font-size: 5rem;
  color: white;
  span:last-child {
    font-weight: 300;
  }
}
</style>
