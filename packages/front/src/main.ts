import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@mdi/font/css/materialdesignicons.css";
import "github-markdown-css/github-markdown.css";
import "leaflet/dist/leaflet.css";
import axios from "axios";

axios.defaults.baseURL = process.env.VUE_APP_API_URL || "http://localhost:3000";

createApp(App).use(router).use(ElementPlus).mount("#app");
