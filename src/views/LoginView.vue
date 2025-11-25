<template>
  <!-- 電腦版：右上角大卡 | 手機版：隱藏大卡 -->
  <transition name="auth-float">
    <div class="auth-floating-card" v-if="!isMobile">
      <div class="auth-container">
        <!-- 你原本完整的大卡內容全部保留（以下直接貼你原本的） -->
        <div v-if="!googleUser && !fbUser" class="demo-login-wrapper partial">
          <button @click="devLogin" class="btn danger">
            一鍵登入（最高權限）
          </button>
        </div>

        <div v-if="!googleUser && !fbUser" class="partial">或</div>

        <div v-if="isLoading" class="loading">
          <p>載入登入功能中...</p>
        </div>

        <div v-else-if="googleUser && fbUser" class="user success premium">
          <div class="avatar-group">
            <div class="avatar-wrapper">
              <img
                :src="googleUser.picture"
                alt="Google"
                class="avatar google"
              />
              <span class="badge google">G</span>
            </div>
            <div class="avatar-wrapper">
              <img :src="fbUser.picture" alt="Facebook" class="avatar fb" />
              <span class="badge fb">f</span>
            </div>
          </div>

          <div class="info">
            <h3 class="greeting">歡迎回來</h3>
            <p class="username">{{ googleUser.name }}</p>
            <div class="verified">
              <span class="check">✓</span>
              <span>最高權限已啟用</span>
            </div>
          </div>

          <button @click="store.reset()" class="btn logout">登出</button>
        </div>

        <div v-else-if="!googleUser && !fbUser" class="login">
          <div id="google-login-button"></div>
          <button @click="facebookLogin" class="btn fb">Facebook 登入</button>
          <p class="hint">請完成雙重驗證以使用完整功能</p>
        </div>

        <div v-else class="partial">
          <div v-if="googleUser && !fbUser" class="status">
            <img :src="googleUser.picture" class="avatar google" />
            <p>已登入 Google</p>
            <button @click="facebookLogin" class="btn fb">
              登入 Facebook 完成驗證
            </button>
          </div>
          <div v-if="fbUser && !googleUser" class="status">
            <img :src="fbUser.picture" class="avatar fb" />
            <p>已登入 Facebook</p>
            <div id="google-login-button"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- 手機專用置底極簡狀態列 -->
  <div v-if="isMobile" class="mobile-status-bar">
    <!-- 未登入：顯示登入按鈕 -->
    <div v-if="!googleUser && !fbUser" class="mobile-login">
      <button @click="devLogin" class="btn danger">一鍵登入（最高權限）</button>
      <div id="google-login-button"></div>
      <button @click="facebookLogin" class="btn fb small">f</button>
    </div>

    <!-- 已登入：顯示頭貼 + 名字 + 最高權限 -->
    <div v-else class="mobile-user">
      <div class="mobile-avatars">
        <img
          v-if="googleUser"
          :src="googleUser.picture"
          class="mini-avatar google"
        />
        <img v-if="fbUser" :src="fbUser.picture" class="mini-avatar fb" />
      </div>
      <span class="mobile-name">{{ googleUser?.name || fbUser?.name }}</span>
      <span v-if="googleUser && fbUser" class="mobile-vip">最高權限</span>
      <button @click="store.reset()" class="mobile-logout">登出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// 自動偵測手機（螢幕寬度 < 768px）
const isMobile = computed(() => window.innerWidth < 768);

// demo專用：一鍵登入（直接塞假資料）
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
};

const store = useAuthStore();
const { googleUser, fbUser, isLoading } = storeToRefs(store);
const { facebookLogin } = useAuth();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables";
@import "@/assets/scss/_mixins";
@import "@/assets/scss/_buttons";

/* 電腦版大卡（你原本的） */
.auth-floating-card {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 380px;
  animation: floatIn 0.6s ease-out;
}

/* 你原本所有大卡樣式全部保留（下面直接貼你原本的） */
.auth-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}
.loading {
  text-align: center;
  padding: 40px 20px;
  color: #555;
  font-size: 1.1rem;
}
.login,
.partial {
  text-align: center;
  padding: 10px 0;
}
.hint {
  margin-top: 16px;
  color: #666;
  font-size: 0.9rem;
}
.status p {
  margin: 12px 0;
  font-size: 1.1rem;
  color: #333;
}
.user.success.premium {
  text-align: center;
  padding: 20px 0;
}
.avatar-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.avatar-wrapper {
  position: relative;
  display: inline-block;
}
.avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 5px solid white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  &.google {
    border-color: #4285f4;
  }
  &.fb {
    border-color: #1877f2;
  }
}
.badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  &.google {
    background: #4285f4;
  }
  &.fb {
    background: #1877f2;
  }
}
.info {
  margin: 12px 0;
}
.greeting {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1b5e20;
}
.username {
  margin: 6px 0 10px;
  font-size: 1.6rem;
  font-weight: bold;
  color: #0d47a1;
}
.verified {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #2e7d32;
  font-weight: 600;
  font-size: 1rem;
}
.check {
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
}
.btn.logout {
  margin-top: 16px;
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
}

/* 手機置底極簡狀態列 */
.mobile-status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  z-index: 9999;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 15px;
  font-weight: 600;
  bottom: env(safe-area-inset-bottom);
}

.mobile-login {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
  .btn.small {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    padding: 0;
    font-size: 20px;
  }
}

.mobile-user {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.mobile-avatars {
  display: flex;
  gap: -10px;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  &.google {
    border-color: #4285f4;
  }
  &.fb {
    border-color: #1877f2;
  }
  &:last-child {
    margin-left: -16px;
  }
}

.mobile-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-vip {
  background: linear-gradient(135deg, #ff4081, #f50057);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.mobile-logout {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 14px;
  padding: 8px;
  cursor: pointer;
}

/* 動畫 */
.auth-float-enter-active,
.auth-float-leave-active {
  transition: all 0.5s ease;
}
.auth-float-enter-from,
.auth-float-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}
@keyframes floatIn {
  from {
    transform: translateY(-100px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
