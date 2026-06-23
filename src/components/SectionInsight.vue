<script setup>
import { ref, computed } from 'vue'
import BaseChart from './BaseChart.vue'
import TeaWordCloud from './TeaWordCloud.vue'
import { barRowsForYear, wordsForYear, insightCards } from '../data/insight.js'
import { timeStore, teaFilterStore } from '../composables/timeStore.js'

const activeGroup = ref('Z世代')
const groups = ['Z世代', '新中产', '银发族']

// 当前年份的三人群偏好（随共享年份变化）
const barData = computed(() => barRowsForYear(timeStore.year))

// 当前人群 + 当前年份的词云数据
const currentWords = computed(() => wordsForYear(activeGroup.value, timeStore.year))

const series = [
  { name: '绿茶', key: 'green', color: '#4f6b58', type: '绿茶' },
  { name: '红茶', key: 'black', color: '#8b3c2c', type: '红茶' },
  { name: '乌龙茶', key: 'oolong', color: '#c57f3a', type: '青茶' },
  { name: '果茶', key: 'fruit', color: '#e7b87f', type: null },
  { name: '花茶', key: 'flower', color: '#a86a8a', type: null },
]

// 该柱系列是否被全局茶类筛选命中
function seriesMatch(s) {
  const f = teaFilterStore.type
  if (!f) return true
  return s.type === f
}

const barOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { bottom: 0, textStyle: { color: '#6b5e4f' } },
  grid: { left: '9%', right: '5%', top: '12%', bottom: '14%', containLabel: true },
  xAxis: {
    type: 'category',
    data: groups,
    axisLabel: {
      color: '#3e3a35',
      fontFamily: 'Noto Serif SC',
      fontSize: 14,
      formatter: (v) => (v === activeGroup.value ? `{a|${v}}` : v),
      rich: { a: { color: '#c57f3a', fontWeight: 'bold', fontSize: 15 } },
    },
    axisLine: { lineStyle: { color: '#e5d9ce' } },
  },
  yAxis: { type: 'value', name: '偏好度 (%)', nameLocation: 'middle', nameGap: 42, nameTextStyle: { color: '#6b5e4f' }, axisLabel: { color: '#6b5e4f' }, splitLine: { lineStyle: { color: '#ede0cd' } } },
  series: series.map((s) => {
    const sMatch = seriesMatch(s)
    return {
      name: s.name,
      type: 'bar',
      stack: 'total',
      data: barData.value.map((i) => {
        // 既受"当前人群"高亮影响，也受"茶类筛选"影响：两者叠加决定不透明度
        const groupActive = i.group === activeGroup.value
        let op = groupActive ? 1 : 0.42
        if (!sMatch) op = groupActive ? 0.28 : 0.12
        return { value: i[s.key], itemStyle: { color: s.color, opacity: op } }
      }),
      emphasis: { focus: 'series' },
      barWidth: '52%',
      animationDurationUpdate: 500,
    }
  }),
}))

const toneColor = { green: '#4f6b58', amber: '#a2652f', blue: '#4a6a7c', red: '#8b3c2c' }
const toneBg = { green: '#eef5ea', amber: '#f6efe5', blue: '#edf2f7', red: '#f8ecec' }

function onBarClick(p) {
  if (p.componentType === 'series') activeGroup.value = p.name && groups.includes(p.name) ? p.name : activeGroup.value
}
function pickGroup(g) { activeGroup.value = g }
</script>

<template>
  <div class="insight-wrap reveal">
    <div class="status">
      <span class="yr-badge">{{ timeStore.year }} 年</span>
      当前分析人群：
      <span class="cur">{{ activeGroup }}</span>
      <span class="picker">
        <button v-for="g in groups" :key="g" :class="{ on: g === activeGroup }" @click="pickGroup(g)">{{ g }}</button>
      </span>
    </div>

    <div class="charts">
      <div class="card">
        <h3 class="ct">茶叶品类偏好分析</h3>
        <BaseChart :option="barOption" :notMerge="true" class="bar" @click="onBarClick" />
      </div>
      <div class="card wc-card">
        <div class="wc-head">
          <h3 class="ct">{{ activeGroup }} · {{ timeStore.year }} 关注词云</h3>
          <span class="live">LIVE DATA</span>
        </div>
        <div class="wc-legend">
          <span><i style="background:#2f5d3a"></i>正向评价</span>
          <span><i style="background:#8b3c2c"></i>负向反馈</span>
          <span><i style="background:#9b8a73"></i>中性词汇</span>
        </div>
        <TeaWordCloud :words="currentWords" class="wc" />
      </div>
    </div>

    <div class="cards">
      <div
        v-for="c in insightCards"
        :key="c.title"
        class="ins"
        :style="{ background: toneBg[c.tone], borderColor: toneColor[c.tone] + '55' }"
      >
        <p class="ins-t" :style="{ color: toneColor[c.tone] }">{{ c.title }}</p>
        <p class="ins-b">{{ c.body }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.insight-wrap { max-width: 1180px; margin: 0 auto; }
.yr-badge {
  display: inline-block;
  font-family: var(--serif);
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  background: var(--tea-amber);
  border-radius: 20px;
  padding: 2px 12px;
  margin-right: 12px;
}
.status { font-size: 14px; color: var(--ink-soft); margin-bottom: 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cur { font-family: var(--serif); font-weight: 700; color: var(--tea-green); }
.picker { display: flex; gap: 6px; margin-left: auto; }
.picker button {
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--ink-soft);
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.picker button.on { background: var(--tea-green); color: #fff; border-color: var(--tea-green); }

.charts { display: grid; grid-template-columns: 7fr 5fr; gap: 24px; margin-bottom: 28px; }
.card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  padding: 22px;
}
.ct { font-family: var(--serif); font-weight: 700; font-size: 19px; color: var(--ink); margin-bottom: 8px; }
.bar { width: 100%; height: 460px; }
.wc-card { display: flex; flex-direction: column; }
.wc-head { display: flex; justify-content: space-between; align-items: center; }
.live {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--tea-green);
  background: #eef5ea;
  border: 1px solid rgba(79, 107, 88, 0.25);
  padding: 3px 10px;
  border-radius: 20px;
}
.wc-legend { display: flex; gap: 16px; margin: 6px 0 4px; }
.wc-legend span { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); }
.wc-legend i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.wc { width: 100%; flex: 1; min-height: 380px; }

.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.ins { border: 1px solid; border-radius: 18px; padding: 22px 24px; }
.ins-t { font-family: var(--serif); font-weight: 700; font-size: 17px; margin-bottom: 8px; }
.ins-b { color: var(--ink-soft); font-size: 14.5px; line-height: 1.8; }

@media (max-width: 900px) {
  .charts { grid-template-columns: 1fr; }
  .cards { grid-template-columns: 1fr; }
  .bar { height: 360px; }
}
</style>
