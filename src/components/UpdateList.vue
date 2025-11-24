<template>
  <!-- Empty State -->
  <div v-if="!items.length" class="empty-state">
    <div class="icon">Map</div>
    <p>點擊上方按鈕，查詢您附近的都更地點</p>
    <small>系統將根據您的位置顯示最近的 10 個都更案</small>
  </div>

  <!-- List with Animation -->
  <TransitionGroup v-else name="list" tag="ul" class="update-list" appear>
    <li
      v-for="(item, index) in sortedItems"
      :key="item.stop_name"
      class="update-item"
      :class="{ 'is-top': index < 3 }"
    >
      <div class="rank" v-if="index < 3">
        <span v-if="index === 0">Gold Medal</span>
        <span v-else-if="index === 1">Silver Medal</span>
        <span v-else>Bronze Medal</span>
      </div>
      <div class="name">
        <strong>{{ item.stop_name }}</strong>
      </div>
      <div class="distance">
        {{ formatDistance(item.distance) }}
      </div>
    </li>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface UpdateItem {
  stop_name: string;
  distance: number;
}

const props = defineProps<{
  items: UpdateItem[];
}>();

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => a.distance - b.distance).slice(0, 10); // 只顯示前 10 名（更專業）
});

const formatDistance = (meters: number): string => {
  if (meters < 50) return "就在附近！";
  if (meters < 1000) return `${Math.round(meters)} 公尺`;
  return `${(meters / 1000).toFixed(1)} 公里`;
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 70px 20px;
  color: #666;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  border-radius: 16px;
  margin: 30px 0;
  border: 2px dashed #ccc;
}

.icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.empty-state small {
  color: #888;
  font-size: 0.95rem;
}

.update-list {
  list-style: none;
  padding: 0;
  margin: 30px 0;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.update-item {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.update-item:hover {
  background: linear-gradient(90deg, #f0f8ff, #f8fdff);
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.update-item:last-child {
  border-bottom: none;
}

.rank {
  margin-right: 16px;
  font-size: 1.5rem;
}

.is-top {
  background: linear-gradient(90deg, #fff8e1, #fff3e0);
  border-left: 6px solid #ff8f00;
}

.name {
  flex: 1;
  font-size: 1.1rem;
  color: #333;
}

.distance {
  color: #d32f2f;
  font-weight: bold;
  font-size: 1.2rem;
  min-width: 100px;
  text-align: right;
}

/* 超讚的動畫 */
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
