module.exports = {
  pages: {
    index: {
      entry: "src/main.ts",
      title: "HISTmap",
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule("md")
      .test(/\.md$/)
      .use("html-loader")
      .loader("html-loader")
      .end()
      .use("markdown-loader")
      .loader("markdown-loader")
      .end();
  },
};
