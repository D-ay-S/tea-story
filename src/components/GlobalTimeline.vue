<script setup>
import { ref } from 'vue'
import { timeStore, YEARS, YEAR_MIN, YEAR_MAX } from '../composables/timeStore.js'

const collapsed = ref(false)
// 刻度（每 5 年一个，含首尾）
const ticks = YEARS.filter((y) => y % 5 === 0 || y === YEAR_MIN || y === YEAR_MAX)

function onInput(e) {
  timeStore.setYear(e.target.value)
}
function step(delta) {
  timeStore.setYear(timeStore.year + delta)
}
// 进度百分比（用于填充与游标定位）
function pct() {
  return ((timeStore.year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100
}
</script>

<template>
  <div class="gt-wrap" :class="{ collapsed }">
    <button class="gt-toggle" @click="collapsed = !collapsed" :title="collapsed ? '展开时间轴' : '收起时间轴'">
      <span class="gt-toggle-year">{{ timeStore.year }}</span>
      <span class="gt-chev">{{ collapsed ? '▴' : '▾' }}</span>
    </button>

    <div class="gt-bar">
      <div class="gt-label">
        <span class="gt-cn">年份</span>
        <span class="gt-year">{{ timeStore.year }}</span>
      </div>

      <button class="gt-step" @click="step(-1)" :disabled="timeStore.year <= YEAR_MIN" aria-label="上一年">‹</button>

      <div class="gt-track-wrap">
        <div class="gt-fill" :style="{ width: pct() + '%' }"></div>
        <input
          class="gt-range"
          type="range"
          :min="YEAR_MIN"
          :max="YEAR_MAX"
          :step="1"
          :value="timeStore.year"
          @input="onInput"
        />
        <div class="gt-ticks">
          <span
            v-for="t in ticks"
            :key="t"
            class="gt-tick"
            :class="{ active: t === timeStore.year }"
            :style="{ left: ((t - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100 + '%' }"
            @click="timeStore.setYear(t)"
          >{{ t }}</span>
        </div>
      </div>

      <button class="gt-step" @click="step(1)" :disabled="timeStore.year >= YEAR_MAX" aria-label="下一年">›</button>

      <div class="gt-hint">全站联动 · 拉动可切换年份</div>
    </div>
  </div>
</template>

<style scoped>
.gt-wrap {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 200;
  width: min(880px, calc(100vw - 40px));
  background: rgba(248, 241, 227, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 14px 40px -12px rgba(80, 55, 25, 0.4);
  transition: transform 0.35s cubic-bezier(0.2, 0.85, 0.3, 1), bottom 0.35s;
}
.gt-wrap.collapsed {
  transform: translateX(-50%) translateY(calc(100% + 30px));
  bottom: 0;
}

/* 收起后露出的小标签 */
.gt-toggle {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-bottom: none;
  background: rgba(248, 241, 227, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px 16px 0 0;
  padding: 6px 18px;
  cursor: pointer;
  font-family: var(--serif);
  color: var(--tea-amber-d);
  box-shadow: 0 -6px 18px -10px rgba(80, 55, 25, 0.4);
}
.gt-toggle-year { font-weight: 700; font-size: 16px; }
.gt-chev { font-size: 12px; color: var(--ink-faint); }

.gt-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px 22px;
}
.gt-label { display: flex; align-items: baseline; gap: 8px; flex-shrink: 0; }
.gt-cn { font-family: var(--serif); font-weight: 700; color: var(--ink); font-size: 15px; }
.gt-year {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 26px;
  color: var(--tea-amber-d);
  min-width: 58px;
}

.gt-step {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--tea-amber-d);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}
.gt-step:hover:not(:disabled) { background: var(--tea-amber); color: #fff; border-color: var(--tea-amber); }
.gt-step:disabled { opacity: 0.35; cursor: not-allowed; }

.gt-track-wrap {
  position: relative;
  flex: 1;
  height: 30px;
  display: flex;
  align-items: center;
}
.gt-range {
  position: relative;
  z-index: 2;
  width: 100%;
  margin: 0;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
.gt-range::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 4px;
  background: #e3d4bd;
}
.gt-range::-moz-range-track {
  height: 5px;
  border-radius: 4px;
  background: #e3d4bd;
}
.gt-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tea-amber);
  border: 3px solid #fffaf2;
  box-shadow: 0 2px 6px rgba(120, 80, 30, 0.4);
  margin-top: -6.5px;
  cursor: pointer;
}
.gt-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tea-amber);
  border: 3px solid #fffaf2;
  box-shadow: 0 2px 6px rgba(120, 80, 30, 0.4);
  cursor: pointer;
}
/* 已走过的进度填充（叠在 track 上） */
.gt-fill {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 5px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--tea-amber-d), var(--tea-amber));
  z-index: 1;
  pointer-events: none;
}

.gt-ticks {
  position: absolute;
  left: 0;
  right: 0;
  top: 26px;
  height: 14px;
}
.gt-tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--ink-faint);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}
.gt-tick:hover { color: var(--tea-amber-d); }
.gt-tick.active { color: var(--tea-amber-d); font-weight: 700; }

.gt-hint {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ink-faint);
  font-family: var(--serif);
}

@media (max-width: 720px) {
  .gt-bar { gap: 10px; padding: 12px 14px 20px; }
  .gt-hint { display: none; }
  .gt-year { font-size: 20px; min-width: 44px; }
}
</style>
