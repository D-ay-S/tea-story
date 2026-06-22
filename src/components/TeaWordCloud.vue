<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const props = defineProps({
  words: { type: Array, required: true }, // [{name,value,sentiment}]
})

const el = ref(null)
const chart = shallowRef(null)
let ro = null

const posColors = ['#2f5d3a', '#4f7c5f', '#6b8f6b']
const negColors = ['#8b3c2c', '#a63f3d', '#c96b67']

function colorOf(sentiment, i) {
  if (sentiment === 'positive') return posColors[i % posColors.length]
  if (sentiment === 'negative') return negColors[i % negColors.length]
  return '#9b8a73'
}

function buildOption() {
  // 去重，避免同名词条叠加渲染
  const seen = new Set()
  const data = (props.words || [])
    .filter((w) => {
      if (seen.has(w.name)) return false
      seen.add(w.name)
      return true
    })
    .map((w, i) => ({
      name: w.name,
      value: w.value,
      sentiment: w.sentiment,
      textStyle: {
        color: colorOf(w.sentiment, i),
        fontWeight: w.value > 80 ? 'bold' : 'normal',
      },
    }))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: '#fffdf8',
      borderColor: '#4f6b58',
      borderWidth: 1,
      textStyle: { color: '#2e2a22' },
      formatter: (p) => {
        const it = p.data || {}
        const s = it.sentiment === 'positive' ? '正向' : it.sentiment === 'negative' ? '负向' : '中性'
        return `<b>${it.name}</b><br/>热度：${it.value}<br/>情绪：${s}`
      },
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '92%',
        height: '92%',
        sizeRange: [14, 56],
        rotationRange: [-20, 20],
        rotationStep: 10,
        gridSize: 8,
        drawOutOfBound: false,
        shrinkToFit: true,
        layoutAnimation: false,
        textStyle: {
          fontFamily: 'Noto Serif SC, PingFang SC, serif',
        },
        emphasis: { textStyle: { textShadowBlur: 6, textShadowColor: 'rgba(0,0,0,0.2)' } },
        data,
      },
    ],
  }
}

let lastW = 0
let lastH = 0
let debounceTimer = null

function render() {
  if (!chart.value || !el.value) return
  const { width, height } = el.value.getBoundingClientRect()
  if (width < 20 || height < 20) return // 容器尚无尺寸，等 ResizeObserver
  chart.value.resize()
  chart.value.clear() // 清掉上一次布局，杜绝词条叠加
  chart.value.setOption(buildOption(), true)
}

// 仅当尺寸真正变化时重绘，并做防抖，避免 ResizeObserver 连续触发造成重叠
function onResize() {
  const { width, height } = el.value.getBoundingClientRect()
  if (Math.abs(width - lastW) < 2 && Math.abs(height - lastH) < 2) return
  lastW = width
  lastH = height
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(render, 120)
}

onMounted(async () => {
  await nextTick()
  chart.value = echarts.init(el.value, null, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  })
  const r = el.value.getBoundingClientRect()
  lastW = r.width
  lastH = r.height
  // 容器尺寸变化时（仅真正变化）防抖重绘
  ro = new ResizeObserver(onResize)
  ro.observe(el.value)
  render()
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  ro && ro.disconnect()
  chart.value && chart.value.dispose()
})

// 词条数据变化（年份/人群切换）→ 重绘（render 内已 clear）
watch(
  () => props.words,
  () => render(),
  { deep: true }
)
</script>

<template>
  <div ref="el" class="tea-wc"></div>
</template>

<style scoped>
.tea-wc {
  width: 100%;
  height: 100%;
}
</style>
