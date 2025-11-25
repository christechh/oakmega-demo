<template>
  <div class="map-wrapper">
    <div ref="mapEl" class="map-container" />

    <!-- 下方 Tab 列表面板 -->
    <div
      v-if="displayItems.length > 0 || tuchengAll.length > 0"
      class="bottom-panel"
    >
      <div class="controls">
        <input
          v-model="searchText"
          placeholder="搜尋地點名稱..."
          class="search-input"
        />
      </div>

      <!-- Tab 切換 -->
      <div class="tab-bar">
        <button
          @click="activeTab = 'nearby'"
          :class="{ active: activeTab === 'nearby' }"
          class="tab-btn"
        >
          附近紅點（{{ items.length }}）
        </button>
        <button
          @click="activeTab = 'all'"
          :class="{ active: activeTab === 'all' }"
          class="tab-btn"
        >
          土城藍點（{{ tuchengAll.length }}）
        </button>
      </div>

      <!-- 列表 -->
      <UpdateList
        :items="filteredItems"
        :toggleDisplay="activeTab === 'nearby'"
        :user-lat="userLocation.lat"
        :user-lng="userLocation.lng"
        @select="flyToItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from "vue";
import L from "leaflet";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import UpdateList from "@/components/UpdateList.vue";

const store = useAuthStore();
const { googleUser, fbUser, isLoading: authLoading } = storeToRefs(store);

const mapEl = ref<HTMLElement | null>(null);
const items = ref<any[]>([]);
const tuchengAll = ref<any[]>([]);
const searchText = ref("");
const activeTab = ref<"nearby" | "all">("nearby");
const userLocation = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

let mapInitialized = false;

let map: L.Map | null = null;
let userMarker: L.Marker | null = null;

// 分開兩個 layer group，一組藍點、一組紅點
let tuchengMarkers = L.layerGroup();
let nearbyMarkers = L.layerGroup();

const initMap = async () => {
  if (map || mapInitialized || !mapEl.value) return;
  mapInitialized = true;
  await nextTick();

  map = L.map(mapEl.value!).setView([24.968, 121.44], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map!);

  try {
    const { data } = await axios.get(
      "https://enterprise.oakmega.ai/api/v1/server/xinbei/geolocation-json?directory=tucheng.json"
    );

    const geo = data.result;

    if (!geo || !geo.features) {
      console.error("格式不是 FeatureCollection", geo);
      return;
    }

    // 將土城 Polygon 畫到地圖
    L.geoJSON(geo, {
      style: {
        color: "#1565C0",
        weight: 5,
        opacity: 0.9,
        fillColor: "#42A5F5",
        fillOpacity: 0.25,
      },
    }).addTo(map!);

    // 將 GeoJSON 轉換成清單資料（支援 Polygon + MultiPolygon）
    tuchengAll.value = geo.features
      .map((f: any) => {
        let coords;

        if (f.geometry.type === "Polygon") {
          // Polygon → coordinates[0][0]
          coords = f.geometry.coordinates[0][0];
        } else if (f.geometry.type === "MultiPolygon") {
          // MultiPolygon → coordinates[0][0][0]
          coords = f.geometry.coordinates[0][0][0];
        } else {
          return null;
        }

        return {
          stop_name: f.properties.TxtMemo || f.properties.分區 || "土城都更區",
          latitude: coords[1],
          longitude: coords[0],
          distance: 0,
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error("載入土城 GeoJSON 失敗", e);
  }

  tuchengMarkers.addTo(map!);
  nearbyMarkers.addTo(map!);

  // 畫出所有土城 marker
  drawTuchengMarkers();
};

const createUserMarker = (lat: number, lng: number) => {
  const g =
    googleUser.value?.picture ||
    "https://via.placeholder.com/48/4285f4/white?text=G";
  const f =
    fbUser.value?.picture ||
    "https://via.placeholder.com/48/1877f2/white?text=F";

  const icon = L.divIcon({
    className: "custom-user-marker",
    html: `
      <div style="position:relative;width:88px;height:128px;transform:translateX(-50%)">
        <div style="position:absolute;top:0;left:0;width:56px;height:56px;border:6px solid #d32f2f;border-radius:50%;overflow:hidden;box-shadow:0 8px 30px rgba(66,133,244,0.6);z-index:2">
          <img src="${g}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div style="position:absolute;top:22px;right:0;width:56px;height:56px;border:6px solid #1877f2;border-radius:50%;overflow:hidden;box-shadow:0 8px 30px rgba(24,119,242,0.6);z-index:1">
          <img src="${f}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:70px;height:70px;background:rgba(0,0,0,0.3);border-radius:50%;filter:blur(20px)"></div>
        <div style="position:absolute;top:88px;left:50%;transform:translateX(-50%);padding:12px 28px;background:#000000ee;color:white;border-radius:40px;font-weight:bold;font-size:16px;white-space:nowrap;box-shadow:0 10px 40px rgba(0,0,0,0.7);border:2px solid #333">
          我在這裡
        </div>
      </div>
    `,
    iconSize: [88, 128],
    iconAnchor: [44, 128],
  });

  if (userMarker) map!.removeLayer(userMarker);
  userMarker = L.marker([lat, lng], {
    icon,
    zIndexOffset: 99999,
  } as L.MarkerOptions).addTo(map!);
};

const drawTuchengMarkers = () => {
  tuchengMarkers.clearLayers();
  tuchengAll.value.forEach((item) => {
    L.circleMarker([item.latitude, item.longitude], {
      radius: 8,
      color: "#1565C0",
      weight: 2,
      fillColor: "#42A5F5",
      fillOpacity: 0.7,
    })
      .bindPopup(`<b>${item.stop_name}</b>`)
      .addTo(tuchengMarkers);
  });
};

const drawNearbyMarkers = () => {
  nearbyMarkers.clearLayers();
  const seen = new Set<string>();
  items.value.forEach((item) => {
    if (!item.stop_name || seen.has(item.stop_name)) return;
    seen.add(item.stop_name);
    L.circleMarker([item.latitude, item.longitude], {
      radius: 10,
      color: "#9a0007",
      weight: 3,
      fillColor: "#d32f2f",
      fillOpacity: 0.9,
    })
      .bindPopup(
        `<b>${item.stop_name}</b><br>距離 ${Math.round(
          item.distance * 1000
        )} 公尺`
      )
      .addTo(nearbyMarkers);
  });
};

const displayItems = computed(() =>
  activeTab.value === "nearby" ? items.value : tuchengAll.value
);
const filteredItems = computed(() => {
  if (!searchText.value) return displayItems.value;
  return displayItems.value.filter((item: any) =>
    item.stop_name?.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const locate = () => {
  // 先確保地圖初始化
  if (!map) {
    initMap().then(() => setTimeout(locate, 100));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      userLocation.value = { lat, lng }; // 給 UpdateList 算距離用
      map!.setView([lat, lng], 16);
      createUserMarker(lat, lng);

      try {
        const { data } = await axios.post(
          "https://enterprise.oakmega.ai/api/v1/server/xinbei/calc-distance",
          { lat, lng }
        );

        const unique = new Map<string, any>();
        (data?.result || []).forEach((item: any) => {
          if (
            !unique.has(item.stop_name) ||
            item.distance < unique.get(item.stop_name).distance
          ) {
            unique.set(item.stop_name, item);
          }
        });

        items.value = Array.from(unique.values())
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, 20);

        activeTab.value = "nearby";
        drawNearbyMarkers();
      } catch (err) {
        console.error(err);
        alert("查詢附近失敗");
      }
    },
    () => alert("請允許定位權限"),
    { enableHighAccuracy: true, timeout: 20000 }
  );
};

let routeLine: L.Polyline | null = null;
let distanceLabel: L.Marker | null = null;
let selectedMarker: L.CircleMarker | null = null;

const flyToItem = (item: any) => {
  if (!map || !userLocation.value.lat || !userLocation.value.lng) return;

  const targetLat = item.latitude;
  const targetLng = item.longitude;
  const myLat = userLocation.value.lat;
  const myLng = userLocation.value.lng;

  // 1. 計算真實距離（公尺）
  const distanceMeters = map.distance([myLat, myLng], [targetLat, targetLng]);
  const distanceKm = distanceMeters / 1000;

  // 2. 飛到目標點（稍微偏移一點可以看到整條線）
  map.setView([targetLat, targetLng], 15, { animate: true, duration: 1.2 });

  // 3. 清除舊的高亮、線、標籤
  if (selectedMarker) map.removeLayer(selectedMarker);
  if (routeLine) map.removeLayer(routeLine);
  if (distanceLabel) map.removeLayer(distanceLabel);

  // 4. 判斷是紅點還是藍點 → 決定顏色
  const isNearby = activeTab.value === "nearby";
  const lineColor = isNearby ? "#d32f2f" : "#1565C0";

  // 5. 畫路線（粗線 + 虛線動畫）
  routeLine = L.polyline(
    [
      [myLat, myLng],
      [targetLat, targetLng],
    ],
    {
      color: lineColor,
      weight: 9,
      opacity: 0.95,
    }
  ).addTo(map);

  // 6. 線中間加距離標籤（超美）
  const midLat = (myLat + targetLat) / 2;
  const midLng = (myLng + targetLng) / 2;

  const labelText =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)} 公尺`
      : `${distanceKm.toFixed(1)} 公里`;

  distanceLabel = L.marker([midLat, midLng], {
    icon: L.divIcon({
      className: "distance-label",
      html: `
        <div style="
          background: ${lineColor};
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: bold;
          font-size: 15px;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border: 4px solid white;
          transform: translate(-50%, -50%);
        ">
          ${labelText}
        </div>
      `,
      iconSize: [140, 50],
      iconAnchor: [70, 25],
    }),
    zIndexOffset: 2000,
  }).addTo(map);

  // 7. 高亮目標點（黃色大圈圈）
  selectedMarker = L.circleMarker([targetLat, targetLng], {
    radius: 18,
    color: "#ffeb3b",
    weight: 6,
    fillColor: "#fff",
    fillOpacity: 1,
  })
    .addTo(map)
    .bindPopup(
      `
      <div style="text-align:center; padding:8px 0;">
        <b style="font-size:1.4em; color:${lineColor};">${item.stop_name}</b>
        <br><small style="color:#666;">${labelText}</small>
      </div>
    `,
      {
        autoClose: false,
        closeOnClick: false,
      }
    )
    .openPopup();
};

watch(
  () => !authLoading.value,
  (ready) => {
    if (ready && mapEl.value && !map) nextTick(initMap);
  },
  { immediate: true }
);

onMounted(() => {
  if (!authLoading.value && mapEl.value && !map) {
    locate();
  }
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables";
@import "@/assets/scss/_mixins";
@import "@/assets/scss/_buttons";

.map-wrapper {
  position: relative;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.locate-btn {
  @include btn-base;
  @extend %btn-success;

  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 16px 40px;
  font-size: 1.3rem;
}

.bottom-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  padding: 20px 16px 16px;
  max-height: 40vh;
  overflow-y: auto;
  z-index: 1000;
  border-top-left-radius: $radius-lg;
  border-top-right-radius: $radius-lg;
  box-shadow: $shadow-heavy;

  &::before {
    content: "";
    display: block;
    width: 48px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 3px;
    margin: 0 auto 16px auto;
  }
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  padding: 14px;
  border-radius: $radius-sm;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1rem;
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

.tab-bar {
  display: flex;
  margin: 12px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $radius-sm;
  padding: 4px;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  &.active {
    background: rgba(255, 255, 255, 0.25);
    color: white;
  }
}

:deep() .custom-user-marker,
:deep() .leaflet-marker-icon,
:deep() .leaflet-marker-shadow {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
</style>
