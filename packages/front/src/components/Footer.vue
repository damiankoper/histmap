<template>
  <div class="footer">
    Created by
    <a href="https://github.com/damiankoper" target="_blank">@damiankoper </a>
    <a href="https://github.com/xksz_11" target="_blank">@xksz_11 </a>
    <a href="https://github.com/hergerr" target="_blank">@hergerr </a>
    <a href="https://github.com/matgwi96" target="_blank">@matgwi96</a>. All
    rights resevered
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
@import "../assets/css/_variables.scss";

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  text-align: center;
  padding: 5px 0;
  font-size: $very-small;

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>
