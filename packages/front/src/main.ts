import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@mdi/font/css/materialdesignicons.css";
import "github-markdown-css/github-markdown.css";
import "leaflet/dist/leaflet.css";

createApp(App).use(router).use(ElementPlus).mount("#app");
