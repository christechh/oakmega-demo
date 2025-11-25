<template>
  <!-- Empty State -->
  <div v-if="!items.length" class="empty-state">
    <div class="icon">Empty</div>
    <p>搜尋無結果</p>
    <small v-if="toggleDisplay">系統將根據您的位置顯示最近的地點</small>
    <small v-else>這裡列出土城所有都更處</small>
  </div>

  <!-- List with Animation -->

  <TransitionGroup v-else name="list" tag="ul" class="update-list" appear>
    <li
      v-for="(item, index) in sortedItems"
      :key="item.stop_name"
      class="update-item"
      :class="{ 'is-top': index < 3 }"
      @click="() => emit('select', item)"
      style="cursor: pointer"
    >
      <div class="name">
        <strong>{{ item.stop_name }}</strong>
      </div>

      <!-- 新增：規劃路線按鈕 -->
      <button
        @click.stop="openRoute(item)"
        class="btn google"
        title="規劃路線"
      >
        規劃路線
      </button>

      <!-- 距離 -->
      <div class="distance" :style="{ color: distanceColor }">
        {{ formatDistance(item.distance ?? 0) }}
      </div>
    </li>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";

interface UpdateItem {
  stop_name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const props = defineProps<{
  items: UpdateItem[];
  toggleDisplay: boolean;
  userLat?: number;
  userLng?: number;
}>();

const emit = defineEmits<{
  select: [item: UpdateItem];
}>();

const { toggleDisplay, userLat, userLng } = toRefs(props);

// 關鍵修正：加上預設值，避免 undefined
const safeUserLat = computed(() => userLat?.value ?? 0);
const safeUserLng = computed(() => userLng?.value ?? 0);

// 動態算距離（土城全部時才需要）
const itemsWithDistance = computed(() => {
  if (toggleDisplay.value && props.items[0]?.distance !== undefined) {
    return props.items;
  }

  // 如果沒有使用者位置，就回傳 0 距離（不會跳錯誤）
  if (!safeUserLat.value || !safeUserLng.value) {
    return props.items.map((item) => ({ ...item, distance: 0 }));
  }

  const lat1 = safeUserLat.value;
  const lng1 = safeUserLng.value;

  return props.items.map((item) => {
    const R = 6371;
    const dLat = ((item.latitude - lat1) * Math.PI) / 180;
    const dLng = ((item.longitude - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((item.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return { ...item, distance };
  });
});

const sortedItems = computed(() => {
  if (!toggleDisplay.value) {
    return itemsWithDistance.value;
  }
  return [...itemsWithDistance.value]
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
    .slice(0, 20);
});

const distanceColor = computed(() => {
  return toggleDisplay.value ? "#d32f2f" : "#1565C0";
});

const formatDistance = (km: number) => {
  const meters = Math.round(km * 1000);
  if (meters < 1000) return `${meters} 公尺`;
  return `${(meters / 1000).toFixed(1)} 公里`;
};

// 開 Google Maps 導航
const openRoute = (item: UpdateItem) => {
  const lat = item.latitude;
  const lng = item.longitude;
  const name = encodeURIComponent(item.stop_name);

  // 手機優先開 Google Maps App，電腦開網頁
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}&travelmode=driving`;

  // iOS 特殊處理（更穩）
  if (
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad")
  ) {
    window.location.href = `maps://maps.google.com/maps/dir/?daddr=${lat},${lng}&directionsmode=driving`;
    setTimeout(() => {
      window.location.href = googleMapsUrl; // 如果沒裝 App 就跳網頁
    }, 1000);
  } else {
    window.open(googleMapsUrl, "_blank");
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables";
@import "@/assets/scss/_mixins";
@import "@/assets/scss/_buttons";

.empty-state {
  text-align: center;
  padding: 70px 20px;
  color: $text-muted;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  border-radius: $radius-md;
  margin: 30px 0;
  border: 2px dashed #ccc;

  .icon {
    font-size: 4rem;
    margin-bottom: 16px;
  }
  p {
    margin: 0 0 8px 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: $text-dark;
  }
  small {
    color: $text-light;
    font-size: 0.95rem;
  }
}

.update-list {
  list-style: none;
  padding: 0;
  margin: 30px 0;
  @include card-base;
  overflow: hidden;
}

.update-item {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  cursor: pointer;
  @include hover-slide;

  &:last-child {
    border-bottom: none;
  }
  &.is-top {
    background: linear-gradient(90deg, #fff8e1, #fff3e0);
    border-left: 6px solid #ff8f00;
  }
}

.name {
  flex: 1;
  font-size: 1.1rem;
  color: $text-dark;
}
.distance {
  font-weight: bold;
  font-size: 1.2rem;
  min-width: 110px;
  text-align: right;
}

// TransitionGroup 動畫（保持原樣）
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.list-leave-active {
  position: absolute;
}
</style>
