import { reactive } from 'vue'

// 全站统一时间轴：2006–2025 逐年，四张图（壹产地 / 叁气候 / 肆出口 / 伍人群）共享
export const YEAR_MIN = 2006
export const YEAR_MAX = 2025
export const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i)

export const timeStore = reactive({
  year: YEAR_MAX, // 默认最新年
  setYear(y) {
    const n = Number(y)
    this.year = Math.min(YEAR_MAX, Math.max(YEAR_MIN, n))
  },
})

// ── 全局「茶类」筛选器（主线）──
// 六大茶类，作为贯穿五图的主线维度
export const TEA_TYPES = ['绿茶', '白茶', '黄茶', '青茶', '红茶', '黑茶']

// 六大类配色（与全站水墨褐黄调统一）
export const TEA_TYPE_COLOR = {
  绿茶: '#4f6b58',
  白茶: '#b5aa8c',
  黄茶: '#cfb53b',
  青茶: '#2e8b9e',
  红茶: '#8b3c2c',
  黑茶: '#5a3a1e',
}

// 出口/人群里的粗分类（红茶/绿茶/其他）映射到主线
export function matchExportTea(coreType, filter) {
  if (!filter) return true
  return coreType === filter
}

export const teaFilterStore = reactive({
  type: null, // null = 全部；否则为六大类之一
  toggle(t) {
    this.type = this.type === t ? null : t
  },
  clear() {
    this.type = null
  },
})
