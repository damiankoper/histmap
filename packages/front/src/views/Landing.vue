<template>
  <div class="container">
    <div class="wrapper">
      <div class="logo">
        <img src="../assets/images/world_map.svg" alt="world map" />
        <h1>HISTmap</h1>
      </div>
      <div class="button-wrapper">
        <button @click="handleClick">Rozpocznij</button>
      </div>
    </div>
    <Footer />
  </div>
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
@import "../assets/css/_variables.scss";

.container {
  width: 100%;
  background-color: #5e7d9a;
  height: 100%;
}
.wrapper {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo {
  display: flex;

  img {
    flex: 1;
    width: 200px;
  }

  h1 {
    flex: 2;
    letter-spacing: 40px;
    font-size: 96px;
    font-weight: 400;
    margin-left: 120px;
    color: white;
  }
}

.button-wrapper {
  text-align: center;
  button {
    background: rgba(170, 170, 170, 0.3);
    cursor: pointer;
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    font-size: $big;
    margin-top: 100px;
    transition: 1s ease;

    &:hover {
      background: rgba(170, 170, 170, 0.6);
    }
  }
}
</style>
