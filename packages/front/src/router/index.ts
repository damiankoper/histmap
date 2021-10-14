import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Map from "../views/Map.vue";
import Landing from "../views/Landing.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
  },
  {
    path: "/map",
    name: "Map",
    component: Map,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
