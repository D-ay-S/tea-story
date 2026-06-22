<script setup>
defineProps({
  liquor: { type: String, default: '#a83a1a' }, // 茶汤色
  leaf: { type: String, default: '#5c6b3a' },    // 叶色
})
</script>

<template>
  <svg viewBox="0 0 120 120" class="teacup-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- 背景圆 -->
    <circle cx="60" cy="60" r="56" :fill="liquor" opacity="0.08" />
    <!-- 杯身 -->
    <path
      d="M30 52 Q30 90 60 92 Q90 90 90 52 Z"
      fill="#fffdf6"
      stroke="#d8c6aa"
      stroke-width="2"
    />
    <!-- 茶汤 -->
    <path
      d="M34 54 Q34 84 60 86 Q86 84 86 54 Z"
      :fill="liquor"
      opacity="0.92"
    />
    <!-- 茶汤高光 -->
    <ellipse cx="60" cy="56" rx="25" ry="5" fill="#fff" opacity="0.22" />
    <!-- 杯耳 -->
    <path d="M90 58 Q104 58 104 70 Q104 82 90 80" fill="none" stroke="#d8c6aa" stroke-width="3" />
    <!-- 杯托 -->
    <ellipse cx="60" cy="98" rx="34" ry="6" fill="#efe1cb" stroke="#d8c6aa" stroke-width="1.5" />
    <!-- 茶叶 1 -->
    <path
      d="M48 40 Q40 28 52 22 Q60 34 48 40 Z"
      :fill="leaf"
    />
    <path d="M50 38 Q49 30 51 24" stroke="#fffdf6" stroke-width="1" fill="none" opacity="0.55" />
    <!-- 茶叶 2 -->
    <path
      d="M70 42 Q82 30 74 20 Q64 30 70 42 Z"
      :fill="leaf"
      opacity="0.85"
    />
    <path d="M71 40 Q73 31 72 22" stroke="#fffdf6" stroke-width="1" fill="none" opacity="0.5" />
    <!-- 热气 -->
    <path d="M55 18 q4 -5 0 -10" stroke="#c9b79a" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round" />
    <path d="M64 18 q-4 -5 0 -10" stroke="#c9b79a" stroke-width="1.6" fill="none" opacity="0.5" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.teacup-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
