<script setup>
import { ref, computed, shallowRef } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'
import { climateData, newsClips } from '../data/climate.js'
import { timeStore } from '../composables/timeStore.js'

const provinces = Object.keys(climateData)
const province = ref('浙江')
const chartRef = ref(null)

const modal = ref(null) // { title, html }

function pearson(x, y) {
  const n = x.length
  if (n !== y.length || n < 3) return null
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0
  for (let i = 0; i < n; i++) {
    sx += x[i]; sy += y[i]; sxy += x[i] * y[i]; sx2 += x[i] ** 2; sy2 += y[i] ** 2
  }
  const num = n * sxy - sx * sy
  const den = Math.sqrt((n * sx2 - sx ** 2) * (n * sy2 - sy ** 2))
  return den === 0 ? null : num / den
}

function corrLabel(r) {
  const a = Math.abs(r)
  if (a >= 0.7) return ['强相关', 'strong']
  if (a >= 0.5) return ['较强相关', 'strong']
  if (a >= 0.3) return ['中等相关', 'moderate']
  return ['弱相关', 'weak']
}

const rows = computed(() => climateData[province.value])
const corrTemp = computed(() => pearson(rows.value.map((d) => d.春季月均气温), rows.value.map((d) => d.春茶总产量)))
const corrRain = computed(() => pearson(rows.value.map((d) => d.春季累计降水量), rows.value.map((d) => d.春茶总产量)))

const option = computed(() => {
  const data = rows.value
  const years = data.map((d) => d.统计年份)
  const markers = data
    .filter((d) => d.极端天气事件)
    .map((d) => ({ name: d.统计年份, value: [String(d.统计年份), d.春茶总产量] }))

  return {
    animationDuration: 500,
    animationEasing: 'cubicInOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(107,94,79,0.12)' } },
      backgroundColor: '#fffbf2',
      borderColor: '#dac5ae',
      borderWidth: 1,
      textStyle: { color: '#3e3a35' },
      formatter: (params) => {
        const year = params[0].axisValue
        let html = `<div style="font-weight:bold;margin-bottom:4px;">${year} 年 · ${province.value}</div>`
        params.forEach((p) => {
          if (p.seriesName === '极端天气') {
            const ev = data.find((d) => d.统计年份 == year)
            if (ev && ev.极端天气事件) {
              const clip = newsClips[`${year}_${ev.所属省份}`]
              html += `<div style="border-top:1px dashed #e0cdb0;margin-top:5px;padding-top:5px;color:#8b3c2c;">`
              html += `${p.marker}<b>极端天气事件</b>`
              html += `<div style="margin-left:18px;margin-top:3px;color:#3e3a35;font-size:12px;line-height:1.7;">`
              html += `类型：<b>${ev.极端天气事件}</b><br/>`
              html += `同比减产：<span style="color:#8b3c2c;font-weight:bold;">${ev.同比减产幅度}%</span>　`
              html += `特级茶涨价：<span style="color:#c57f3a;font-weight:bold;">${ev.特级茶价格涨幅}%</span>`
              if (clip) {
                html += `<br/><span style="color:#6b5e4f;">新闻：${clip.headline}</span>`
                html += `<br/><span style="color:#9b8a73;font-size:11px;">来源：${clip.source} ｜ ${clip.date}</span>`
              }
              html += `<br/><span style="color:#a2652f;font-size:11px;">🔎 点击图标查看完整新闻报道</span>`
              html += `</div></div>`
            }
            return
          }
          const unit = p.seriesName === '气温' ? ' ℃' : p.seriesName === '降水' ? ' mm' : ' 吨'
          html += `<div style="margin:2px 0;">${p.marker}${p.seriesName}：${p.value}${unit}</div>`
        })
        return html
      },
    },
    legend: { top: 6, textStyle: { color: '#3e3a35' }, data: ['气温', '降水', '春茶产量', '极端天气'] },
    grid: { left: 64, right: 150, top: 52, bottom: 64 },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: { rotate: 45, color: '#6b5e4f' },
      axisLine: { lineStyle: { color: '#e5d9ce' } },
    },
    yAxis: [
      { type: 'value', name: '气温(℃)', position: 'left', nameTextStyle: { color: '#c57f3a', fontSize: 10 }, axisLabel: { color: '#6b5e4f', fontSize: 10 }, splitLine: { show: false } },
      { type: 'value', name: '降水(mm)', position: 'right', nameTextStyle: { color: '#7b9dad', fontSize: 10 }, axisLabel: { color: '#6b5e4f', fontSize: 10 }, splitLine: { show: false } },
      { type: 'value', name: '产量(吨)', position: 'right', offset: 62, nameTextStyle: { color: '#4f6b58', fontSize: 13, fontWeight: 'bold' }, axisLabel: { color: '#4f6b58', fontSize: 11 }, splitLine: { lineStyle: { color: '#e5d9ce', type: 'dashed' } } },
    ],
    dataZoom: [
      { type: 'inside', start: 0, end: 100, zoomOnMouseWheel: false, moveOnMouseMove: true, minSpan: 5 },
      { type: 'slider', start: 0, end: 100, height: 22, bottom: 8, showDetail: false, borderColor: '#e5d9ce', backgroundColor: '#fffbf5', fillerColor: 'rgba(197,127,58,0.25)', textStyle: { color: '#6b5e4f' } },
    ],
    series: [
      { name: '降水', type: 'line', yAxisIndex: 1, data: data.map((d) => d.春季累计降水量), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(123,157,173,0.65)', width: 1.2, type: 'dashed' }, itemStyle: { color: '#7b9dad' } },
      { name: '气温', type: 'line', yAxisIndex: 0, data: data.map((d) => d.春季月均气温), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(197,127,58,0.55)', width: 1.2 }, itemStyle: { color: '#c57f3a' } },
      {
        name: '春茶产量', type: 'line', yAxisIndex: 2, data: data.map((d) => d.春茶总产量), smooth: true, symbol: 'circle', symbolSize: 7,
        lineStyle: { color: '#4f6b58', width: 3.5, shadowBlur: 12, shadowColor: 'rgba(79,107,88,0.5)' },
        itemStyle: { color: '#4f6b58', borderColor: '#fffbf5', borderWidth: 2.5 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79,107,88,0.6)' }, { offset: 0.5, color: 'rgba(79,107,88,0.18)' }, { offset: 1, color: 'rgba(79,107,88,0.01)' }]) },
        markLine: { data: [{ type: 'average', name: '均值' }], silent: true, symbol: 'none', lineStyle: { color: '#4f6b58', type: 'dashed', width: 2, opacity: 0.6 }, label: { position: 'start', distance: 8, color: '#4f6b58', fontSize: 11, fontWeight: 'bold', formatter: (p) => '年均\n' + p.value.toFixed(0) + '吨' } },
        z: 3,
      },
      {
        name: '极端天气', type: 'scatter', yAxisIndex: 2, symbol: 'pin', symbolSize: 42, cursor: 'pointer', data: markers,
        itemStyle: { color: '#8b3c2c', borderColor: '#fffbf5', borderWidth: 1.5 },
        label: { show: true, formatter: '⚠', position: 'inside', fontSize: 18, color: '#fff' },
        emphasis: { scale: 1.3, itemStyle: { color: '#c57f3a' } },
        z: 10,
      },
      {
        // 当前共享年份高亮：竖线 + 高亮点
        name: '当前年份', type: 'line', yAxisIndex: 2, data: [], silent: true,
        markLine: {
          silent: true, symbol: 'none', animationDuration: 300,
          lineStyle: { color: '#c57f3a', width: 2, type: 'solid', opacity: 0.85, shadowBlur: 8, shadowColor: 'rgba(197,127,58,0.4)' },
          label: { show: true, position: 'insideEndTop', color: '#a2652f', fontWeight: 'bold', fontSize: 12, formatter: () => `▾ ${timeStore.year}` },
          data: [{ xAxis: String(timeStore.year) }],
        },
        markPoint: {
          symbol: 'circle', symbolSize: 13, animation: true,
          itemStyle: { color: '#c57f3a', borderColor: '#fffbf5', borderWidth: 3, shadowBlur: 10, shadowColor: 'rgba(197,127,58,0.6)' },
          data: (() => {
            const ev = data.find((d) => d.统计年份 === timeStore.year)
            return ev ? [{ coord: [String(timeStore.year), ev.春茶总产量] }] : []
          })(),
        },
        z: 11,
      },
    ],
  }
})

function onChartClick(p) {
  // 点击任意位置的年份，写回共享年份（与图1/4/5 联动）
  if (p.name && /^\d{4}$/.test(String(p.name))) timeStore.setYear(p.name)
  if (p.seriesName === '极端天气') {
    const ev = rows.value.find((d) => d.统计年份 == p.name)
    if (ev && ev.极端天气事件) openModal(ev)
  }
}

function openModal(ev) {
  const clip = newsClips[`${ev.统计年份}_${ev.所属省份}`]
  let html = `
    <p><b>省份：</b>${ev.所属省份}</p>
    <p><b>天气类型：</b>${ev.极端天气事件}</p>
    <p><b>同比减产：</b>${ev.同比减产幅度}%</p>
    <p><b>特级茶价格涨幅：</b>${ev.特级茶价格涨幅}%</p>`
  if (clip) {
    html += `<hr><h4>${clip.headline}</h4>
      <p class="src">来源：${clip.source} ｜ ${clip.date}</p>
      <blockquote>${clip.quote}</blockquote>
      <p>${clip.body}</p>`
  } else {
    html += `<p class="warn">该年度气候异常导致茶叶萌芽期受损，高端茶供不应求，茶农损失严重。</p>`
  }
  modal.value = { title: `${ev.统计年份}年 · ${ev.极端天气事件}`, html }
}
function closeModal() { modal.value = null }
</script>

<template>
  <div class="climate-wrap reveal">
    <div class="controls">
      <div class="seg">
        <button
          v-for="p in provinces"
          :key="p"
          :class="{ on: province === p }"
          @click="province = p"
        >{{ p }}</button>
      </div>
      <div class="corr-panel">
        <div class="corr">
          <span>气温-产量</span>
          <b :style="{ color: '#c57f3a' }">{{ corrTemp != null ? corrTemp.toFixed(3) : 'N/A' }}</b>
          <em v-if="corrTemp != null" :class="['tag', corrLabel(corrTemp)[1]]">{{ corrLabel(corrTemp)[0] }}</em>
        </div>
        <div class="corr">
          <span>降水-产量</span>
          <b :style="{ color: '#7b9dad' }">{{ corrRain != null ? corrRain.toFixed(3) : 'N/A' }}</b>
          <em v-if="corrRain != null" :class="['tag', corrLabel(corrRain)[1]]">{{ corrLabel(corrRain)[0] }}</em>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <BaseChart ref="chartRef" :option="option" :notMerge="true" @click="onChartClick" class="chart" />
    </div>
    <p class="foot">2006–2025 · 6 个主要产茶省份 · 琥珀色竖线 = 当前联动年份（点击图中年份可切换，与图1/4/5 同步）· 点击 ⚠ 查看当年极端天气新闻</p>

    <!-- 弹窗 -->
    <transition name="fade">
      <div v-if="modal" class="overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <span class="close" @click="closeModal">×</span>
          <h3>{{ modal.title }}</h3>
          <div class="modal-body" v-html="modal.html"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.climate-wrap { max-width: 1140px; margin: 0 auto; position: relative; }
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.seg { display: flex; gap: 8px; flex-wrap: wrap; }
.seg button {
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--ink-soft);
  padding: 8px 18px;
  border-radius: 30px;
  cursor: pointer;
  font-family: var(--serif);
  font-size: 14px;
  transition: all 0.2s;
}
.seg button:hover { border-color: var(--tea-amber); }
.seg button.on {
  background: var(--tea-amber);
  color: #fff;
  border-color: var(--tea-amber);
  box-shadow: 0 4px 12px rgba(197, 127, 58, 0.3);
}
.corr-panel {
  display: flex;
  gap: 22px;
  background: rgba(197, 127, 58, 0.06);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 18px;
}
.corr { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--ink-soft); }
.corr b { font-size: 16px; }
.tag { font-size: 11px; padding: 1px 8px; border-radius: 10px; font-style: normal; }
.tag.weak { background: rgba(107, 94, 79, 0.12); color: #6b5e4f; }
.tag.moderate { background: rgba(197, 127, 58, 0.16); color: #a2652f; }
.tag.strong { background: rgba(139, 60, 44, 0.16); color: #8b3c2c; }

.chart-card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  padding: 12px;
}
.chart { width: 100%; height: 540px; }
.foot { text-align: center; font-size: 12.5px; color: var(--ink-faint); margin-top: 14px; letter-spacing: 0.5px; }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(46, 42, 34, 0.45);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: #fffbf2;
  border: 1px solid #dac5ae;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(60, 45, 25, 0.3);
  max-width: 520px;
  width: 100%;
  max-height: 82vh;
  overflow-y: auto;
  padding: 30px;
  position: relative;
}
.close {
  position: absolute;
  top: 16px;
  right: 22px;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  color: var(--ink-soft);
}
.modal h3 { color: var(--tea-red); font-size: 21px; margin-bottom: 14px; font-family: var(--serif); }
.modal-body :deep(p) { line-height: 1.8; margin: 5px 0; color: var(--ink); }
.modal-body :deep(h4) { color: var(--tea-amber-d); margin: 10px 0; }
.modal-body :deep(blockquote) { border-left: 3px solid var(--tea-red); padding-left: 12px; color: var(--ink-soft); font-style: italic; margin: 12px 0; }
.modal-body :deep(.src) { font-size: 12px; color: var(--ink-faint); }
.modal-body :deep(hr) { border: none; border-top: 1px solid var(--line); margin: 14px 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .chart { height: 420px; }
  .controls { flex-direction: column; align-items: stretch; }
}
</style>
