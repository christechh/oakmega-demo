// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export const useAuthStore = defineStore("auth", () => {
  // 從 localStorage 讀取（刷新頁面也不會登出！）
  const googleUser = ref<User | null>(
    JSON.parse(localStorage.getItem("googleUser") || "null")
  );
  const fbUser = ref<User | null>(
    JSON.parse(localStorage.getItem("fbUser") || "null")
  );
  const isLoading = ref(false); // 一開始不用 loading 了

  const isLoggedIn = computed(() => !!googleUser.value && !!fbUser.value);

  const setGoogleUser = (user: User | null) => {
    googleUser.value = user;
    if (user) {
      localStorage.setItem("googleUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("googleUser");
    }
  };

  const setFbUser = (user: User | null) => {
    fbUser.value = user;
    if (user) {
      localStorage.setItem("fbUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("fbUser");
    }
  };

  const reset = () => {
    setGoogleUser(null);
    setFbUser(null);
  };

  // 監聽變化，自動同步到 localStorage（超專業！）
  watch(googleUser, (newVal) => {
    if (newVal) {
      localStorage.setItem("googleUser", JSON.stringify(newVal));
    } else {
      localStorage.removeItem("googleUser");
    }
  });

  watch(fbUser, (newVal) => {
    if (newVal) {
      localStorage.setItem("fbUser", JSON.stringify(newVal));
    } else {
      localStorage.removeItem("fbUser");
    }
  });

  return {
    googleUser,
    fbUser,
    isLoggedIn,
    isLoading,
    setGoogleUser,
    setFbUser,
    reset,
  };
});
