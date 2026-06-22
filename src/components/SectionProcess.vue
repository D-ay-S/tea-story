<script setup>
import { ref, computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { teaData, featureKeys } from '../data/sixTeas.js'

// 默认选中绿茶 + 红茶，最多 2 个对比
const selected = ref(['绿茶', '红茶'])

const allValues = teaData.flatMap((t) => Object.values(t.features))
const globalMax = Math.ceil(Math.max(...allValues) * 1.1)

function toggle(name) {
  const arr = [...selected.value]
  const i = arr.indexOf(name)
  if (i > -1) {
    if (arr.length > 1) arr.splice(i, 1)
  } else {
    if (arr.length >= 2) arr.shift()
    arr.push(name)
  }
  selected.value = arr
}

const selectedTeas = computed(() =>
  teaData.filter((t) => selected.value.includes(t.name))
)

// 两茶对比时，计算共有 / 各自独有的工艺步骤
const isCompare = computed(() => selectedTeas.value.length === 2)

const sharedSteps = computed(() => {
  if (!isCompare.value) return new Set()
  const [a, b] = selectedTeas.value
  const setB = new Set(b.process)
  return new Set(a.process.filter((s) => setB.has(s)))
})

function isUnique(tea, step) {
  if (!isCompare.value) return false
  return !sharedSteps.value.has(step)
}

// 各自独有步骤列表（用于差异摘要）
const uniqueSummary = computed(() => {
  if (!isCompare.value) return []
  return selectedTeas.value.map((tea) => ({
    name: tea.name,
    color: tea.color,
    steps: tea.process.filter((s) => !sharedSteps.value.has(s)),
  }))
})

const radarOption = computed(() => ({
  backgroundColor: 'transparent',
  title: {
    text: '理化成分对比',
    left: 'center',
    top: 6,
    textStyle: { color: '#4f6b58', fontSize: 16, fontWeight: 500, fontFamily: 'Noto Serif SC' },
  },
  legend: {
    bottom: 6,
    data: selectedTeas.value.map((t) => t.name),
    textStyle: { color: '#6b5e4f' },
  },
  tooltip: { trigger: 'item' },
  radar: {
    center: ['50%', '52%'],
    radius: '66%',
    indicator: featureKeys.map((k) => ({ name: k, max: globalMax })),
    axisName: { color: '#6b5e4f', fontSize: 12 },
    splitArea: { areaStyle: { color: ['rgba(180,210,150,0.05)', 'rgba(197,127,58,0.04)'] } },
    splitLine: { lineStyle: { color: '#dfd0b8' } },
    axisLine: { lineStyle: { color: '#cdb893' } },
  },
  series: selectedTeas.value.map((tea) => ({
    name: tea.name,
    type: 'radar',
    data: [
      {
        value: featureKeys.map((k) => tea.features[k]),
        name: tea.name,
        areaStyle: { color: tea.color + '33' },
        lineStyle: { color: tea.color, width: 2.5 },
        itemStyle: { color: tea.color },
        symbol: 'circle',
        symbolSize: 5,
      },
    ],
  })),
}))
</script>

<template>
  <div class="six-wrap reveal">
    <!-- 发酵度光谱 -->
    <div class="spectrum">
      <div class="spectrum-labels">
        <span>发酵度 0%</span>
        <span>发酵度 100%</span>
      </div>
      <div class="spectrum-bar">
        <button
          v-for="tea in teaData"
          :key="tea.name"
          class="tea-btn"
          :class="{ active: selected.includes(tea.name) }"
          :style="{ background: tea.color }"
          @click="toggle(tea.name)"
        >
          <span class="cn">{{ tea.name }}</span>
          <span class="en">{{ tea.en }}</span>
        </button>
      </div>
      <p class="hint">点击色块对比（最多两种）· 从左到右发酵度递增</p>
    </div>

    <!-- 雷达 + 工艺 -->
    <div class="grid">
      <div class="card radar-card">
        <BaseChart :option="radarOption" :notMerge="true" class="radar" />
      </div>

      <div class="card flow-card">
        <div class="flow-head">
          <h3 class="flow-title">加工工艺流程</h3>
          <div v-if="isCompare" class="flow-legend">
            <span class="lg shared">共有工序</span>
            <span class="lg unique">关键差异</span>
          </div>
        </div>

        <div class="flow-list">
          <div v-for="tea in selectedTeas" :key="tea.name" class="flow-row">
            <div class="flow-label">
              <span class="dot" :style="{ background: tea.color }"></span>
              <span class="nm">{{ tea.name }}</span>
            </div>
            <div class="flow-steps">
              <template v-for="(step, i) in tea.process" :key="i">
                <span
                  class="step"
                  :class="{ unique: isUnique(tea, step), shared: isCompare && !isUnique(tea, step) }"
                  :style="isUnique(tea, step)
                    ? { borderColor: tea.color, background: tea.color, color: '#fff' }
                    : { borderColor: isCompare ? '#d8c9ad' : tea.color }"
                >
                  {{ step }}
                  <i v-if="isUnique(tea, step)" class="badge">关键</i>
                </span>
                <span
                  v-if="i < tea.process.length - 1"
                  class="arrow"
                  :style="{ color: isUnique(tea, step) || isUnique(tea, tea.process[i + 1]) ? tea.color : '#c9b799' }"
                >→</span>
              </template>
            </div>
          </div>
        </div>

        <!-- 差异摘要 -->
        <div v-if="isCompare" class="flow-diff">
          <div class="diff-title">工艺关键差异</div>
          <div class="diff-rows">
            <div v-for="u in uniqueSummary" :key="u.name" class="diff-row">
              <span class="diff-dot" :style="{ background: u.color }"></span>
              <b :style="{ color: u.color }">{{ u.name }}</b>
              <template v-if="u.steps.length">
                独有
                <span v-for="s in u.steps" :key="s" class="diff-chip" :style="{ borderColor: u.color, color: u.color }">{{ s }}</span>
              </template>
              <span v-else class="diff-none">无独有工序（工艺与对方一致）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.six-wrap { max-width: 1140px; margin: 0 auto; }
.spectrum { margin-bottom: 30px; }
.spectrum-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--ink-soft);
  font-weight: 500;
  margin-bottom: 8px;
  padding: 0 4px;
}
.spectrum-bar {
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}
.tea-btn {
  flex: 1;
  border: none;
  cursor: pointer;
  color: #fff;
  padding: 16px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  opacity: 0.62;
  transition: all 0.25s ease;
}
.tea-btn:hover { filter: brightness(1.08); }
.tea-btn.active {
  opacity: 1;
  transform: scale(1.03);
  box-shadow: inset 0 -6px 0 rgba(255, 255, 255, 0.85);
  z-index: 2;
}
.tea-btn .cn { font-family: var(--serif); font-weight: 600; font-size: 16px; letter-spacing: 1px; }
.tea-btn .en { font-size: 10.5px; font-style: italic; opacity: 0.85; }
.hint { text-align: center; font-size: 13px; color: var(--ink-faint); margin-top: 12px; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  padding: 22px;
}
.radar { width: 100%; height: 440px; }

.flow-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.flow-title {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 19px;
  color: var(--tea-green);
}
.flow-legend { display: flex; gap: 12px; }
.flow-legend .lg { font-size: 11.5px; display: flex; align-items: center; gap: 5px; color: var(--ink-soft); }
.flow-legend .lg::before {
  content: '';
  width: 14px; height: 10px; border-radius: 3px; display: inline-block;
}
.flow-legend .shared::before { background: #fff; border: 2px solid #d8c9ad; }
.flow-legend .unique::before { background: var(--tea-amber); border: 2px solid var(--tea-amber); }

.flow-list { display: flex; flex-direction: column; gap: 26px; }
.flow-label { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.dot { width: 13px; height: 13px; border-radius: 4px; }
.nm { font-family: var(--serif); font-weight: 600; color: var(--tea-green); }
.flow-steps { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; }
.step {
  position: relative;
  background: #fff;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 9px 15px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e3b1a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.25s;
}
/* 共有工序：弱化 */
.step.shared {
  background: #faf6ec;
  color: #9b8a73;
  box-shadow: none;
}
/* 关键差异：强调（色块填充 + 上浮 + 角标） */
.step.unique {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(120, 80, 30, 0.45);
}
.step .badge {
  position: absolute;
  top: -9px;
  right: -8px;
  font-style: normal;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: var(--tea-red);
  border-radius: 10px;
  padding: 1px 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.arrow { margin: 0 8px; font-size: 18px; transition: color 0.25s; }

.flow-diff {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px dashed var(--line);
}
.diff-title {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
  margin-bottom: 12px;
}
.diff-rows { display: flex; flex-direction: column; gap: 10px; }
.diff-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13.5px; color: var(--ink-soft); }
.diff-dot { width: 11px; height: 11px; border-radius: 50%; }
.diff-chip {
  border: 1.5px solid;
  border-radius: 14px;
  padding: 2px 11px;
  font-size: 12.5px;
  font-weight: 600;
  background: #fff;
}
.diff-none { color: var(--ink-faint); font-style: italic; }

@media (max-width: 880px) {
  .grid { grid-template-columns: 1fr; }
  .radar { height: 360px; }
  .tea-btn .cn { font-size: 13px; }
}
</style>
