module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `
            @import "@/assets/scss/global.scss";
          `,
      },
    },
  },
};
