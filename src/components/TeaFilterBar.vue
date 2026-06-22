<script setup>
import { teaFilterStore, TEA_TYPES, TEA_TYPE_COLOR } from '../composables/timeStore.js'
</script>

<template>
  <div class="tf-wrap">
    <span class="tf-label">茶类主线</span>
    <div class="tf-chips">
      <button
        v-for="t in TEA_TYPES"
        :key="t"
        class="tf-chip"
        :class="{ on: teaFilterStore.type === t, dim: teaFilterStore.type && teaFilterStore.type !== t }"
        :style="teaFilterStore.type === t
          ? { background: TEA_TYPE_COLOR[t], borderColor: TEA_TYPE_COLOR[t], color: '#fff' }
          : { borderColor: TEA_TYPE_COLOR[t] + '88', color: TEA_TYPE_COLOR[t] }"
        @click="teaFilterStore.toggle(t)"
      >{{ t }}</button>
      <button v-if="teaFilterStore.type" class="tf-clear" @click="teaFilterStore.clear()">× 全部</button>
    </div>
    <span class="tf-hint">{{ teaFilterStore.type ? `已聚焦「${teaFilterStore.type}」· 产地 / 出口 / 人群同步` : '点击聚焦某一茶类，三张图同时响应' }}</span>
  </div>
</template>

<style scoped>
.tf-wrap {
  position: sticky;
  top: 52px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px 20px;
  background: rgba(246, 239, 226, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.tf-label {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}
.tf-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.tf-chip {
  border: 1.5px solid;
  background: var(--paper-2);
  border-radius: 20px;
  padding: 5px 16px;
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tf-chip:hover { transform: translateY(-1px); }
.tf-chip.on { box-shadow: 0 4px 12px -3px rgba(80, 55, 25, 0.45); }
.tf-chip.dim { opacity: 0.4; }
.tf-clear {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
}
.tf-clear:hover { background: var(--paper-3); }
.tf-hint { font-size: 12px; color: var(--ink-faint); }

@media (max-width: 720px) {
  .tf-hint { display: none; }
  .tf-wrap { top: 48px; gap: 8px; }
}
</style>
