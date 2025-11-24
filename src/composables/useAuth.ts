import { onMounted } from "vue";
import { useAuthStore, type User } from "@/stores/auth";

export function useAuth() {
  const store = useAuthStore();

  // 用變數儲存已經 narrow 過的 Google API
  let googleIdApi: GoogleAccountsID | null = null;

  // Google JWT 解析（超穩）
  const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Google token 解析失敗", e);
      return null;
    }
  };

  // 動態載入 Google GSI
  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        googleIdApi = window.google.accounts.id;
        return resolve();
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          googleIdApi = window.google.accounts.id;
          resolve();
        } else {
          reject(new Error("Google API 載入失敗"));
        }
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // 動態載入 Facebook SDK
  const loadFacebookSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.FB) return resolve();

      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: import.meta.env.VITE_FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v20.0",
        });
        resolve();
      };

      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/zh_TW/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // 初始化 SDK（只執行一次）
  onMounted(async () => {
    try {
      await Promise.all([loadGoogleScript(), loadFacebookSDK()]);

      // Google 初始化 + 登入回乎
      googleIdApi!.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          const payload = parseJwt(response.credential);
          if (payload) {
            const user: User = {
              id: payload.sub as string,
              name: (payload.name as string) ?? "Google User",
              email: (payload.email as string) ?? "",
              picture: payload.picture as string,
            };
            store.setGoogleUser(user);
            console.log("Google 登入成功，已存入 Pinia + localStorage");
          }
        },
      });

      // 如果已經有 localStorage 資料，自動登入
      if (store.googleUser && store.fbUser) {
        console.log("檢測到 localStorage 登入狀態，自動登入完成");
      }
    } catch (err) {
      console.error("登入 SDK 載入失敗", err);
    }
  });

  // Google 手動觸發登入
  const googleLogin = () => {
    if (!googleIdApi) {
      alert("Google 登入尚未準備好，請稍候...");
      return;
    }
    googleIdApi.prompt();
  };

  // Facebook 登入
  const facebookLogin = () => {
    if (!window.FB) {
      alert("Facebook 登入尚未準備好，請稍候...");
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          window.FB!.api<FBUser>(
            "/me",
            { fields: "name,email,picture.width(200).height(200)" },
            (user) => {
              if (user && !("error" in user)) {
                const getPictureUrl = (pic: any): string => {
                  if (typeof pic === "string") return pic;
                  if (pic?.data?.url) return pic.data.url;
                  return "";
                };

                const fbUserData: User = {
                  id: user.id,
                  name: user.name ?? "Facebook User",
                  email: user.email ?? "",
                  picture: getPictureUrl(user.picture),
                };

                store.setFbUser(fbUserData);
                console.log(
                  "Facebook 登入成功，已存入 Pinia + localStorage",
                  fbUserData
                );
              }
            }
          );
        } else {
          console.log("Facebook 登入取消或失敗");
        }
      },
      { scope: "public_profile" }
    );
  };

  // 只返回動作，不返回狀態（狀態由 Pinia 管理）
  return {
    googleLogin,
    facebookLogin,
    isLoading: store.isLoading,
  };
}
