import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue"; // 你的登入頁
import MapView from "@/views/MapView.vue"; // 你的地圖頁

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "login", component: LoginView },
    { path: "/map", name: "map", component: MapView },
  ],
});

export default router;
