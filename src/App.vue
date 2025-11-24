<template>
  <div class="container">
    <h1>新北市都更查詢</h1>

    <!-- 登入元件 -->
    <LoginView />

    <!-- 雙重登入成功才顯示地圖 -->
    <MapView v-if="isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
import LoginView from "@/views/LoginView.vue";
import MapView from "@/views/MapView.vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

// 從 Pinia 拿全域登入狀態
const store = useAuthStore();
const { isLoggedIn } = storeToRefs(store);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Noto Sans TC", sans-serif;
}
</style>
