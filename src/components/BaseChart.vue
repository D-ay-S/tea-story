<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  notMerge: { type: Boolean, default: false },
  // 额外注册：'gl' | 'wordcloud'
  extra: { type: String, default: '' },
})

const emit = defineEmits(['ready', 'click', 'mouseover', 'mouseout'])
const el = ref(null)
const chart = shallowRef(null)

async function ensureExtra() {
  if (props.extra === 'gl') await import('echarts-gl')
  if (props.extra === 'wordcloud') await import('echarts-wordcloud')
}

async function init() {
  await ensureExtra()
  if (!el.value) return
  chart.value = echarts.init(el.value, null, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    renderer: 'canvas',
  })
  chart.value.setOption(props.option, props.notMerge)
  chart.value.on('click', (p) => emit('click', p))
  chart.value.on('mouseover', (p) => emit('mouseover', p))
  chart.value.on('mouseout', (p) => emit('mouseout', p))
  emit('ready', chart.value)
}

function resize() {
  chart.value && chart.value.resize()
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart.value && chart.value.dispose()
})

watch(
  () => props.option,
  (opt) => chart.value && chart.value.setOption(opt, props.notMerge),
  { deep: true }
)

defineExpose({ getChart: () => chart.value, resize })
</script>

<template>
  <div ref="el" class="echart-root"></div>
</template>

<style scoped>
.echart-root {
  width: 100%;
  height: 100%;
}
</style>
