<template>
  <div v-if="isLoading" class="loading">
    <p>地圖載入中...</p>
  </div>

  <div v-else class="map-wrapper">
    <div ref="mapEl" class="map-container" />

    <!-- 只有登入才顯示按鈕 -->
    <button v-if="isLoggedIn" @click="locate" class="locate-btn">
      查詢附近都更地點
    </button>

    <!-- 列表只在有資料時顯示 -->
    <UpdateList v-if="items.length" :items="items" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import UpdateList from "@/components/UpdateList.vue";

// ───── Pinia 狀態（全部都有用到，零警告）────
const store = useAuthStore();
const { isLoggedIn, googleUser, fbUser } = storeToRefs(store);

// ───── 地圖與資料 ─────
const mapEl = ref<HTMLElement | null>(null);
const items = ref<Array<{ stop_name: string; distance: number }>>([]);
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
let nearbyMarkers: L.LayerGroup = L.layerGroup(); // 用 LayerGroup 管理，超乾淨！

const isLoading = ref(true);

// ───── 修復 Leaflet 圖示（最穩寫法）────
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

// ───── 初始化地圖 + Polygon ─────
const initMap = async () => {
  if (!mapEl.value) return;
  await nextTick();

  fixLeafletIcons();

  map = L.map(mapEl.value).setView([24.968, 121.44], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  // 載入土城都更範圍
  try {
    const { data } = await axios.get(
      "https://enterprise.oakmega.ai/api/v1/server/xinbei/geolocation-json?directory=tucheng.json"
    );
    L.geoJSON(data, {
      style: {
        color: "#d32f2f",
        weight: 5,
        opacity: 0.9,
        fillColor: "#d32f2f",
        fillOpacity: 0.2,
      },
    }).addTo(map);
  } catch (err) {
    console.warn("Polygon 載入失敗", err);
  }

  // 把 nearbyMarkers 加入地圖
  nearbyMarkers.addTo(map);
};

// ───── 雙大頭貼 Marker（超帥！）────
const createUserMarker = (lat: number, lng: number) => {
  const gPic =
    googleUser.value?.picture ||
    "https://via.placeholder.com/44/4285f4/white?text=G";
  const fPic =
    fbUser.value?.picture ||
    "https://via.placeholder.com/44/1877f2/white?text=F";

  const icon = L.divIcon({
    className: "double-avatar-marker",
    html: `
      <div style="position:relative;width:60px;height:80px;">
        <img src="${gPic}" style="width:44px;height:44px;border-radius:50%;border:4px solid #4285f4;position:absolute;top:0;left:0;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <img src="${fPic}" style="width:44px;height:44px;border-radius:50%;border:4px solid #1877f2;position:absolute;top:20px;right:0;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <div style="background:#fff;width:28px;height:28px;border-radius:50%;border:4px solid #333;position:absolute;bottom:0;left:50%;transform:translateX(-50%);box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [60, 80],
    iconAnchor: [30, 80],
  });

  if (userMarker) map?.removeLayer(userMarker);
  userMarker = L.marker([lat, lng], { icon })
    .addTo(map!)
    .bindTooltip("您在這裡", {
      permanent: true,
      direction: "top",
      offset: [0, -60],
      className: "user-tooltip",
    })
    .openTooltip();
};

// ───── 附近都更點 Marker（用 CircleMarker 沒警告！）────
const addNearbyMarkers = () => {
  nearbyMarkers.clearLayers();

  items.value.forEach((item) => {
    // 隨機散佈在土城區（API 沒給經緯度）
    const lat = 24.95 + Math.random() * 0.04;
    const lng = 121.42 + Math.random() * 0.04;

    const marker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: "#d32f2f",
      color: "#9a0007",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    }).bindPopup(`
      <div style="font-weight:bold;padding:4px 0;">
        ${item.stop_name}
      </div>
      <div style="color:#666;font-size:0.9em;">
        距離約 ${item.distance.toFixed(0)} 公尺
      </div>
    `);

    nearbyMarkers.addLayer(marker);
  });
};

// ───── 主要功能：定位 + 查詢 ─────
const locate = () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      map?.setView([lat, lng], 16);
      createUserMarker(lat, lng);

      try {
        const { data } = await axios.post(
          "https://enterprise.oakmega.ai/api/v1/server/xinbei/calc-distance",
          { lat, lng }
        );
        items.value = data || [];
        nextTick(addNearbyMarkers);
      } catch {
        alert("查詢失敗，請再試一次");
      }
    },
    () => alert("請允許定位權限"),
    { enableHighAccuracy: true, timeout: 20000 }
  );
};

// ───── 監聽 items 變化自動更新地圖 ─────
watch(items, () => {
  if (items.value.length && map) addNearbyMarkers();
});

// ───── 初始化地圖（等 auth 完成）────
watch(
  () => !store.isLoading,
  (ready) => {
    if (ready && mapEl.value && !map) {
      initMap();
      isLoading.value = false;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!store.isLoading && mapEl.value) {
    initMap();
    isLoading.value = false;
  }
});
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 80px;
  color: #666;
  font-size: 1.2rem;
}
.map-wrapper {
  position: relative;
}
.map-container {
  height: 70vh;
  min-height: 520px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}
.locate-btn {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 16px 40px;
  background: linear-gradient(135deg, #00c853, #00b248);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 200, 83, 0.4);
  transition: all 0.3s;
}
.locate-btn:hover {
  transform: translateX(-50%) translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 200, 83, 0.5);
}
:deep(.user-tooltip) {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  font-weight: bold;
}
</style>
