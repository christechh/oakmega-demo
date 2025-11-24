<template>
  <div class="auth-container">
    <div style="margin: 20px 0; text-align: center">
      <button
        @click="devLogin"
        style="
          padding: 12px 24px;
          background: #ff5722;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        "
      >
        開發者一鍵登入（跳過 Google + Facebook）
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="isLoading" class="loading">
      <p>載入登入功能中...</p>
    </div>

    <!-- 兩個都登入成功 → 顯示歡迎 -->
    <div v-else-if="googleUser && fbUser" class="user success">
      <img :src="googleUser.picture" alt="Google" class="avatar google" />
      <img :src="fbUser.picture" alt="Facebook" class="avatar fb" />
      <div class="info">
        <p class="welcome">歡迎，{{ googleUser.name }}！</p>
        <small>已完成 Google 與 Facebook 雙重驗證</small>
      </div>
      <button @click="store.reset()" class="btn logout">登出</button>
    </div>

    <!-- 還沒登入任何一個 → 顯示兩個登入按鈕 -->
    <div v-else-if="!googleUser && !fbUser" class="login">
      <button @click="googleLogin" class="btn google">Google 登入</button>
      <button @click="facebookLogin" class="btn fb">Facebook 登入</button>
      <p class="hint">請先完成 Google 與 Facebook 雙重登入</p>
    </div>

    <!-- 只登入一個 → 顯示已登入的 + 提示登入另一個 -->
    <div v-else class="partial">
      <!-- 已登入 Google，缺 Facebook -->
      <div v-if="googleUser && !fbUser" class="status">
        <img :src="googleUser.picture" class="avatar google" />
        <p>Google 已登入：{{ googleUser.name }}</p>
        <button @click="facebookLogin" class="btn fb">
          登入 Facebook 完成驗證
        </button>
      </div>

      <!-- 已登入 Facebook，缺 Google -->
      <div v-if="fbUser && !googleUser" class="status">
        <img :src="fbUser.picture" class="avatar fb" />
        <p>Facebook 已登入：{{ fbUser.name }}</p>
        <button @click="googleLogin" class="btn google">
          登入 Google 完成驗證
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { watch } from "vue";

const router = useRouter();

// 開發者專用：一鍵登入（直接塞假資料）
const devLogin = () => {
  store.setGoogleUser({
    id: "google-123",
    name: "謝松樺",
    email: "you@gmail.com",
    picture: "https://picsum.photos/200?random=1",
  });

  store.setFbUser({
    id: "fb-456",
    name: "謝松樺",
    email: "you@facebook.com",
    picture: "https://picsum.photos/200?random=2",
  });

  alert("開發者一鍵登入成功！現在可以直接用全部功能");
};

const store = useAuthStore();
const { googleUser, fbUser, isLoading } = storeToRefs(store);
const { googleLogin, facebookLogin } = useAuth();

// 雙重登入完成 → 自動跳轉到地圖
watch(
  () => googleUser.value && fbUser.value,
  (loggedIn) => {
    if (loggedIn) {
      router.push("/map");
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.auth-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 1.2rem;
}

.login,
.partial {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hint {
  margin-top: 16px;
  color: #666;
  font-size: 0.95rem;
}

.status {
  text-align: center;
  padding: 30px;
}

.status p {
  margin: 16px 0;
  font-size: 1.1rem;
  color: #333;
}

.user.success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #e8f5e8, #e3f2fd);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  flex-wrap: wrap;
}

.welcome {
  margin: 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #1b5e20;
}

.user.success small {
  color: #2e7d32;
  font-weight: 500;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.google {
  border-color: #4285f4;
  margin: 5px;
}
.fb {
  border-color: #1877f2;
  margin: 5px;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.google {
  background: linear-gradient(135deg, #4285f4, #34a853);
}
.fb {
  background: linear-gradient(135deg, #1877f2, #3b5998);
}
.logout {
  background: #d32f2f;
}
</style>
