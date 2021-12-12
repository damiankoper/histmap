<template>
  <router-view />
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Lato", sans-serif;
  color: var(--el-text-color-primary);
}
.el-notification {
  z-index: 999999 !important;
}
</style>
