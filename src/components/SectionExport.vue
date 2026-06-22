<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'
import { exportData, chinaCoord } from '../data/exports.js'
import { timeStore, teaFilterStore } from '../composables/timeStore.js'

const selectedCountry = ref(null)
const hoverSource = ref('globe') // 'globe' | 'flat'，决定饼图弹窗显示在哪张图上
const worldReady = ref(false)
const worldFailed = ref(false)

// 茶类配色（地球飞线 / 平面飞线共用，水墨墨绿赭调）
const teaColor = { 红茶: '#7c3a2a', 绿茶: '#4a5a46', 其他: '#9c8a5a' }
function colorByTea(t) {
  return teaColor[t] || teaColor['其他']
}
// 全局茶类筛选：该流向是否匹配（出口数据只有红/绿茶核心类）
function exportMatch(d) {
  const f = teaFilterStore.type
  if (!f) return true
  return d.核心进口茶类 === f
}

const currentData = computed(() => exportData.filter((d) => d.统计年份 === timeStore.year))

const globeOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: '#fffaf2',
    borderColor: '#dac5ae',
    textStyle: { color: '#2e2a22' },
    formatter: (p) => {
      const d = p.data?.raw
      if (!d) return ''
      return `<b>${d.出口目标国}</b><br/>${d.统计年份} · ${d.所属大洲}<br/>贸易额：${d.贸易额}${d.贸易额单位}<br/>出口量：${d.出口量}${d.出口量单位}<br/>核心茶类：${d.核心进口茶类}`
    },
  },
  globe: {
    baseTexture: './image/earth.jpg',
    shading: 'color',
    globeRadius: 100,
    environment: '#f3e6c8', // 暖黄背景
    light: {
      main: { color: '#fff3d6', intensity: 1.0, shadow: false },
      ambient: { intensity: 1.1 },
    },
    // 暖金大气层
    atmosphere: { show: true, offset: 2, color: '#e6c878', glowPower: 3, innerGlowPower: 0.9 },
    viewControl: {
      autoRotate: true,
      autoRotateSpeed: 5,
      autoRotateAfterStill: 3,
      distance: 178,
      alpha: 25,
      beta: 60,
      damping: 0.85,
    },
    postEffect: {
      enable: true,
      bloom: { enable: false },
      FXAA: { enable: true },
    },
    temporalSuperSampling: { enable: true },
  },
  series: [
    {
      name: '出口流向',
      type: 'lines3D',
      coordinateSystem: 'globe',
      // 系列级兜底色 + 每条线按茶类着色，避免个别线不渲染
      lineStyle: { width: 2.4, opacity: 0.85, color: '#7c3a2a' },
      effect: { show: true, trailWidth: 3, trailLength: 0.3, trailOpacity: 0.85 },
      data: currentData.value.map((d) => ({
        coords: [chinaCoord, d.经纬度],
        raw: d,
        lineStyle: { color: colorByTea(d.核心进口茶类), opacity: exportMatch(d) ? 0.85 : 0.08 },
      })),
    },
    {
      name: '国家节点',
      type: 'scatter3D',
      coordinateSystem: 'globe',
      symbolSize: 12,
      itemStyle: { color: '#7c3a2a', opacity: 1 },
      label: {
        show: true, formatter: '{b}', position: 'top', distance: 6,
        color: '#4a2e18', fontSize: 13, fontWeight: 'bold',
        backgroundColor: 'rgba(243,230,200,0.92)', padding: [3, 6], borderRadius: 4,
      },
      emphasis: { itemStyle: { color: '#c57f3a' } },
      data: currentData.value.map((d) => ({
        name: d.出口目标国, value: d.经纬度, raw: d,
        itemStyle: { color: colorByTea(d.核心进口茶类), opacity: exportMatch(d) ? 1 : 0.18 },
      })),
    },
    {
      name: '中国',
      type: 'scatter3D',
      coordinateSystem: 'globe',
      symbolSize: 15,
      label: { show: true, formatter: '中国', position: 'top', color: '#4a2e18', fontSize: 14, fontWeight: 'bold', backgroundColor: 'rgba(243,230,200,0.94)', padding: [3, 6], borderRadius: 4 },
      itemStyle: { color: '#5a3a1e' }, // 深褐
      data: [{ name: '中国', value: chinaCoord }],
    },
  ],
}))

const pieOption = computed(() => {
  if (!selectedCountry.value) return {}
  const c = selectedCountry.value
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    color: ['#7c3a2a', '#4a5a46', '#9c8a5a'],
    series: [
      {
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '52%'],
        label: { formatter: '{b}\n{c}%', fontSize: 13, color: '#2e2a22' },
        labelLine: { length: 12, length2: 8 },
        itemStyle: { borderColor: '#fffaf2', borderWidth: 2 },
        data: [
          { name: '红茶', value: c.红茶进口占比 },
          { name: '绿茶', value: c.绿茶进口占比 },
          { name: '其他', value: c.其他茶类占比 },
        ],
      },
    ],
  }
})

function onGlobeClick(p) {
  if (p.seriesName === '国家节点' && p.data?.raw) {
    selectedCountry.value = p.data.raw
    hoverSource.value = 'globe'
  }
}
let hoverClearTimer = null
// 悬停某国节点 → 显示其茶类占比饼图；移出 → 延迟关闭（避免在节点与标签间移动时闪烁）
function onNodeHover(p, source) {
  if (p.seriesName === '国家节点' && p.data?.raw) {
    clearTimeout(hoverClearTimer)
    selectedCountry.value = p.data.raw
    hoverSource.value = source
  }
}
function onNodeOut(p) {
  if (p.seriesName === '国家节点') {
    clearTimeout(hoverClearTimer)
    hoverClearTimer = setTimeout(() => {
      selectedCountry.value = null
    }, 200)
  }
}

// ── 2D 平面流向图 ──
const maxTrade = Math.max(...exportData.map((d) => d.贸易额))

const flatOption = computed(() => {
  if (!worldReady.value) return {}
  const lines = currentData.value.map((d) => {
    const col = colorByTea(d.核心进口茶类)
    const m = exportMatch(d)
    return {
      coords: [chinaCoord, d.经纬度],
      raw: d,
      lineStyle: { color: col, width: 1 + (d.贸易额 / maxTrade) * 3, opacity: m ? 0.6 : 0.06 },
    }
  })
  const nodes = currentData.value.map((d) => ({
    name: d.出口目标国,
    value: [...d.经纬度, d.贸易额],
    raw: d,
    itemStyle: { color: colorByTea(d.核心进口茶类), opacity: exportMatch(d) ? 1 : 0.2 },
  }))
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fffaf2',
      borderColor: '#dac5ae',
      textStyle: { color: '#2e2a22' },
      formatter: (p) => {
        const d = p.data?.raw
        if (!d) return p.name || ''
        return `<b>${d.出口目标国}</b><br/>${d.统计年份} · ${d.所属大洲}<br/>贸易额：${d.贸易额}${d.贸易额单位}<br/>出口量：${d.出口量}${d.出口量单位}<br/>核心茶类：<span style="color:${colorByTea(d.核心进口茶类)};font-weight:bold">${d.核心进口茶类}</span>`
      },
    },
    geo: {
      map: 'world',
      roam: true,
      zoom: 1,
      center: [10, 20],
      scaleLimit: { min: 1, max: 6 },
      itemStyle: { areaColor: '#efe1cb', borderColor: '#d8c2a0', borderWidth: 0.6 },
      emphasis: { itemStyle: { areaColor: '#f0d9b6' }, label: { show: false } },
      regions: [
        { name: 'China', itemStyle: { areaColor: '#d9a441' } },
        { name: '中国', itemStyle: { areaColor: '#d9a441' } },
      ],
    },
    series: [
      {
        name: '出口流向',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        // 不固定 effect.color，让箭头拖尾继承每条线各自的 lineStyle.color（按茶类）
        effect: { show: true, period: 5, trailLength: 0.5, symbol: 'arrow', symbolSize: 6 },
        lineStyle: { opacity: 0.6, curveness: 0.25 },
        data: lines,
      },
      {
        name: '中国',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 3 },
        symbolSize: 12,
        itemStyle: { color: '#a2652f' },
        label: { show: true, formatter: '中国', position: 'right', color: '#a2652f', fontWeight: 'bold', fontSize: 12 },
        data: [{ name: '中国', value: chinaCoord }],
      },
      {
        name: '国家节点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 2.5 },
        symbolSize: (val) => 8 + (val[2] / maxTrade) * 16,
        label: { show: true, formatter: (p) => p.data.name, position: 'top', color: '#8b3c2c', fontSize: 11, fontWeight: 'bold' },
        data: nodes,
      },
    ],
  }
})

function onFlatClick(p) {
  if (p.seriesName === '国家节点' && p.data?.raw) {
    selectedCountry.value = p.data.raw
    hoverSource.value = 'flat'
  }
}

onMounted(async () => {
  try {
    if (echarts.getMap && echarts.getMap('world')) {
      worldReady.value = true
      return
    }
    const mod = await import('../data/world.json')
    echarts.registerMap('world', mod.default || mod)
    worldReady.value = true
  } catch (e) {
    worldFailed.value = true
  }
})
</script>

<template>
  <div class="export-wrap reveal">
    <div class="dual-card">
      <div class="views">
        <!-- 左：3D 地球 -->
        <div class="view-pane globe-pane">
          <div class="pane-tag">3D 地球 · 可旋转</div>
          <BaseChart
            :option="globeOption"
            :notMerge="true"
            extra="gl"
            class="globe"
            @click="onGlobeClick"
            @mouseover="(p) => onNodeHover(p, 'globe')"
            @mouseout="onNodeOut"
          />

          <transition name="pop">
            <div v-if="selectedCountry && hoverSource === 'globe'" class="pie-pop">
              <div class="pie-title">{{ selectedCountry.出口目标国 }}<br />进口中国茶叶占比</div>
              <BaseChart :option="pieOption" :notMerge="true" class="pie" />
            </div>
          </transition>
        </div>

        <!-- 右：2D 平面流向图 -->
        <div class="view-pane flat-pane">
          <div class="pane-tag">2D 平面 · 全球流向</div>
          <div class="tea-legend">
            <span><i style="background:#7c3a2a"></i>红茶</span>
            <span><i style="background:#4a5a46"></i>绿茶</span>
            <span><i style="background:#9c8a5a"></i>其他</span>
          </div>
          <div v-if="worldFailed" class="flat-fail">🍂 世界地图加载失败，请检查网络后刷新</div>
          <BaseChart
            v-else-if="worldReady"
            :option="flatOption"
            :notMerge="true"
            class="flat"
            @click="onFlatClick"
            @mouseover="(p) => onNodeHover(p, 'flat')"
            @mouseout="onNodeOut"
          />
          <div v-else class="flat-loading">地图加载中…</div>

          <transition name="pop">
            <div v-if="selectedCountry && hoverSource === 'flat'" class="pie-pop">
              <div class="pie-title">{{ selectedCountry.出口目标国 }}<br />进口中国茶叶占比</div>
              <BaseChart :option="pieOption" :notMerge="true" class="pie" />
            </div>
          </transition>
        </div>
      </div>
    </div>
    <p class="note">左侧地球可拖拽旋转 · 右侧平面图呈现全球流向 · 两图共享年份与数据 · 鼠标悬停任一图的国家节点即可查看其进口茶类占比</p>
  </div>
</template>

<style scoped>
.export-wrap { max-width: 1240px; margin: 0 auto; }
.dual-card {
  background: radial-gradient(circle at 50% 30%, #f8f3e8, #efe6d6);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  padding: 20px;
  position: relative;
}
.views {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.view-pane {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 250, 240, 0.5);
  border: 1px solid var(--line-soft);
}
.pane-tag {
  position: absolute;
  top: 12px;
  left: 14px;
  z-index: 6;
  font-family: var(--serif);
  font-size: 12px;
  color: var(--ink-soft);
  background: rgba(255, 250, 240, 0.92);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 3px 12px;
}
.tea-legend {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 6;
  display: flex;
  gap: 12px;
  background: rgba(255, 250, 240, 0.92);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 4px 12px;
}
.tea-legend span { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--ink-soft); }
.tea-legend i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.globe { width: 100%; height: 460px; }
.flat { width: 100%; height: 460px; }
.flat-loading,
.flat-fail {
  height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-soft);
  font-size: 14px;
}

.pie-pop {
  position: absolute;
  left: 14px;
  bottom: 14px;
  width: 280px;
  background: rgba(255, 250, 240, 0.97);
  border: 1px solid #d8c6aa;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(60, 40, 20, 0.22);
  padding: 14px 12px 6px;
  z-index: 9;
}
.close {
  position: absolute;
  top: 8px;
  right: 14px;
  font-size: 24px;
  cursor: pointer;
  color: var(--tea-red);
  line-height: 1;
}
.pie-title {
  text-align: center;
  font-family: var(--serif);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink);
}
.pie { width: 100%; height: 200px; }

.note { text-align: center; font-size: 13px; color: var(--ink-faint); margin-top: 14px; }

.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.85, 0.3, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(12px) scale(0.96); }

@media (max-width: 880px) {
  .views { grid-template-columns: 1fr; }
  .globe, .flat, .flat-loading, .flat-fail { height: 380px; }
  .pie-pop { width: 240px; }
  .pie { height: 170px; }
}
</style>
