<script setup>
import { ref, computed, onMounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { teaOrigins, buildProvinceTeaMap, provinceLabels, teaRegionColor, yieldOf, teaTypeOf } from '../data/origins.js'
import { timeStore, YEARS, teaFilterStore } from '../composables/timeStore.js'
import TeaCup from './TeaCup.vue'

const mapEl = ref(null)
const chart = shallowRef(null)
const loadFailed = ref(false)
const selectedProvince = ref(null)

const provinceTeaAgg = buildProvinceTeaMap()
// 以两年中的最大产量为基准，保证散点尺寸跨年份可比
const maxYield = Math.max(
  ...teaOrigins.flatMap((t) => YEARS.map((y) => yieldOf(t, y)))
)

// 按年份生成散点数据（受全局茶类筛选影响：匹配则高亮，否则淡化）
function buildScatter(year) {
  const filter = teaFilterStore.type
  return teaOrigins.map((o) => {
    const y = yieldOf(o, year)
    const type = teaTypeOf(o.代表茶品)
    const match = !filter || type === filter
    return {
      name: `${o.省份} ${o.城市}`,
      value: [o.经纬度[0], o.经纬度[1], y],
      itemStyle: {
        color: teaRegionColor[o.所属茶区] || '#c57f3a',
        opacity: match ? 1 : 0.12,
        borderColor: match ? '#fff6ec' : 'transparent',
      },
      raw: o,
      yearYield: y,
      year,
      teaType: type,
    }
  })
}

const labelData = provinceLabels.map((p) => ({
  name: p.short,
  full: p.full,
  value: p.center,
}))

const currentTeas = computed(() => {
  if (!selectedProvince.value) return null
  const v = provinceTeaAgg.get(selectedProvince.value)
  return v ? v.teas : null
})

// 当前茶类筛选在产地数据中是否无匹配
const filterEmpty = computed(() => {
  const f = teaFilterStore.type
  if (!f) return false
  return !teaOrigins.some((o) => teaTypeOf(o.代表茶品) === f)
})

function buildOption(year) {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fffaf2',
      borderColor: '#dac5ae',
      borderWidth: 1,
      textStyle: { color: '#2e2a22' },
      formatter: (p) => {
        if (p.seriesName === '茶叶产地' && p.data?.raw) {
          const d = p.data.raw
          return `<b>🍃 ${d.代表茶品}</b><br/>产自 ${d.省份}${d.城市}<br/>海拔 ${d.平均海拔}m · ${d.土壤类型}<br/>${p.data.year} 年产量 ${Number(p.data.yearYield).toLocaleString()} 吨<br/><span style="color:#a2652f">${d.品质特征}</span>`
        }
        if (p.seriesName === '省份标签') return `<b>${p.data.name}</b><br/>点击查看名茶`
        return p.name
      },
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      center: [104, 35.5],
      aspectScale: 0.85,
      label: { show: false },
      itemStyle: {
        areaColor: '#efe1cb',
        borderColor: '#c9ae86',
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: { areaColor: '#f5e0bf', borderColor: '#c57f3a', borderWidth: 2 },
        label: { show: false },
      },
      select: {
        itemStyle: { areaColor: '#e9c79a' },
        label: { show: false },
      },
    },
    series: [
      {
        name: '中华茶区',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        label: { show: false },
        emphasis: { label: { show: false } },
      },
      {
        name: '茶叶产地',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: buildScatter(year),
        symbolSize: (val) => 9 + (val[2] / maxYield) * 24,
        itemStyle: { borderColor: '#fff6ec', borderWidth: 1.6, shadowBlur: 6, shadowColor: 'rgba(80,50,20,0.25)' },
        emphasis: { scale: 1.3 },
        universalTransition: true,
        animationDurationUpdate: 600,
        zlevel: 3,
      },
      {
        name: '省份标签',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: labelData,
        symbol: 'none',
        label: {
          show: true,
          formatter: (p) => p.data.name,
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'Ma Shan Zheng, serif',
          color: '#a2652f',
          backgroundColor: 'rgba(255,248,235,0.78)',
          padding: [3, 9],
          borderRadius: 30,
          borderColor: '#e2bc8c',
          borderWidth: 1,
        },
        emphasis: { label: { fontSize: 15, backgroundColor: '#fff2e2' } },
        zlevel: 4,
      },
    ],
  }
}

function selectProvince(full) {
  selectedProvince.value = provinceTeaAgg.has(full) ? full : null
}

// 仅更新散点 series，避免重渲染整张地图
function updateScatter(year) {
  if (!chart.value) return
  chart.value.setOption({
    series: [{ name: '茶叶产地', data: buildScatter(year) }],
  })
}

onMounted(() => {
  fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    .then((r) => r.json())
    .then((geo) => {
      echarts.registerMap('china', geo)
      chart.value = echarts.init(mapEl.value, null, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      })
      chart.value.setOption(buildOption(timeStore.year))
      chart.value.on('click', (params) => {
        if (params.seriesType === 'map') selectProvince(params.name)
        else if (params.seriesName === '省份标签') {
          const m = provinceLabels.find((p) => p.short === params.data.name)
          selectProvince(m ? m.full : params.data.name)
        }
      })
      window.addEventListener('resize', () => chart.value && chart.value.resize())
    })
    .catch(() => (loadFailed.value = true))
})

// 共享年份变化（无论由本图还是出口图触发）→ 同步更新散点
watch(
  () => timeStore.year,
  (y) => updateScatter(y)
)

// 茶类筛选变化 → 刷新散点高亮
watch(
  () => teaFilterStore.type,
  () => updateScatter(timeStore.year)
)
</script>

<template>
  <div class="origin-wrap reveal">
    <div class="map-card">
      <div v-if="loadFailed" class="map-fail">🍂 地图底图加载失败，请检查网络后刷新</div>
      <div ref="mapEl" class="china-map"></div>
      <transition name="fade">
        <div v-if="filterEmpty" class="filter-empty">
          本数据集中「{{ teaFilterStore.type }}」无主要产地标注——它本就是产地稀少的小众茶类
        </div>
      </transition>
      <div class="map-note">散点大小 = 当年产茶量 ｜ 颜色 = 所属茶区 ｜ 点击省份查看名茶</div>
      <div class="region-legend">
        <span v-for="(c, k) in teaRegionColor" :key="k" class="leg">
          <i :style="{ background: c }"></i>{{ k }}
        </span>
      </div>
    </div>

    <aside class="detail-card">
      <transition name="slide" mode="out-in">
        <div v-if="currentTeas" :key="selectedProvince" class="detail-body">
          <div class="prov-head">✎ {{ selectedProvince }} · 茶品藏珍</div>
          <div class="tea-list">
            <div v-for="t in currentTeas" :key="t.name" class="tea-card">
              <div class="tea-illus" :style="{ background: (t.profile?.liquor || teaRegionColor[t.region]) + '14' }">
                <TeaCup :liquor="t.profile?.liquor || '#a83a1a'" :leaf="t.profile?.leaf || teaRegionColor[t.region]" />
              </div>
              <div class="tea-text">
                <div class="tea-name-row">
                  <span class="tea-name">{{ t.name }}</span>
                  <span v-if="t.profile" class="tea-cat" :style="{ color: teaRegionColor[t.region], borderColor: teaRegionColor[t.region] + '66' }">{{ t.profile.category }}</span>
                </div>
                <p v-if="t.profile" class="tea-intro">{{ t.profile.intro }}</p>
                <div class="tea-meta">
                  <span v-if="t.profile"><b>香气</b>{{ t.profile.aroma }}</span>
                  <span v-if="t.profile"><b>滋味</b>{{ t.profile.taste }}</span>
                  <span><b>产区</b>{{ t.city }} · 海拔 {{ t.altitude }}m</span>
                  <span v-if="t.profile"><b>冲泡</b>{{ t.profile.brew }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else key="empty" class="detail-empty">
          <div class="empty-circle">茶</div>
          <p>轻点左侧地图中的产茶省份<br />一幅名茶画卷将在此展开</p>
        </div>
      </transition>
    </aside>
  </div>
</template>

<style scoped>
.origin-wrap {
  display: grid;
  grid-template-columns: 2.1fr 1fr;
  gap: 24px;
  max-width: 1240px;
  margin: 0 auto;
}
.map-card,
.detail-card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}
.map-card { padding: 18px; }
.china-map {
  width: 100%;
  height: 520px;
  border-radius: 18px;
  background: #fbf5e9;
}
.map-fail {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-soft);
  z-index: 5;
}
.map-note {
  font-family: var(--brush);
  font-size: 13px;
  color: var(--ink-soft);
  background: #f5ede0;
  display: inline-block;
  padding: 5px 16px;
  border-radius: 30px;
  position: absolute;
  bottom: 28px;
  left: 28px;
  box-shadow: 2px 2px 0 rgba(120, 90, 40, 0.15);
}
.filter-empty {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  background: rgba(255, 250, 240, 0.95);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  color: var(--ink-soft);
  box-shadow: var(--shadow-soft);
  max-width: 80%;
  text-align: center;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.region-legend {
  position: absolute;
  top: 26px;
  right: 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 250, 240, 0.9);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
}
.leg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-soft);
}
.leg i {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  display: inline-block;
}

.detail-card { padding: 30px 22px; display: flex; flex-direction: column; }
.detail-body {
  overflow-y: auto;
  max-height: 600px;
  padding-right: 6px;
  margin-right: -6px;
}
.detail-body::-webkit-scrollbar { width: 7px; }
.detail-body::-webkit-scrollbar-thumb { background: #d4bd97; border-radius: 10px; }
.prov-head {
  font-family: var(--brush);
  font-size: 26px;
  color: var(--tea-amber-d);
  border-left: 7px solid var(--tea-amber);
  padding-left: 16px;
  margin-bottom: 24px;
}
.tea-list { display: flex; flex-direction: column; gap: 16px; }
.tea-card {
  display: flex;
  gap: 14px;
  background: #fffff7;
  border: 1px solid var(--line-soft);
  border-radius: 20px 12px 20px 12px;
  padding: 14px;
  box-shadow: 4px 5px 0 #ecdcc4;
  transition: transform 0.2s, box-shadow 0.2s;
}
.tea-card:hover {
  transform: translateY(-3px);
  box-shadow: 7px 9px 0 #dcc9a8;
}
.tea-illus {
  flex-shrink: 0;
  width: 78px;
  height: 78px;
  border-radius: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tea-text { flex: 1; min-width: 0; }
.tea-name-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.tea-name {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 19px;
  color: var(--tea-amber-d);
}
.tea-cat {
  font-size: 11px;
  border: 1px solid;
  border-radius: 20px;
  padding: 1px 8px;
  white-space: nowrap;
}
.tea-intro {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 8px;
}
.tea-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--ink-faint);
  line-height: 1.55;
}
.tea-meta b {
  color: var(--ink-soft);
  font-weight: 600;
  margin-right: 6px;
}
.detail-empty {
  height: 100%;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--ink-faint);
}
.empty-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px dashed #d4ad7a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--brush);
  font-size: 42px;
  color: var(--tea-amber);
  background: #fff6ea;
  margin-bottom: 22px;
}

.slide-enter-active,
.slide-leave-active { transition: all 0.4s cubic-bezier(0.2, 0.85, 0.3, 1); }
.slide-enter-from { opacity: 0; transform: translateX(28px); }
.slide-leave-to { opacity: 0; transform: translateX(-20px); }

@media (max-width: 900px) {
  .origin-wrap { grid-template-columns: 1fr; }
  .china-map { height: 440px; }
  .detail-empty { min-height: 280px; }
}
</style>
