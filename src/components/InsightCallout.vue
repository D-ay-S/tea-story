<script setup>
import { computed } from 'vue'
import { crossInsights } from '../data/crossInsights.js'
import { teaFilterStore, TEA_TYPE_COLOR } from '../composables/timeStore.js'

const props = defineProps({
  slot: { type: String, required: true }, // crossInsights 的键
})

const text = computed(() => {
  const node = crossInsights[props.slot]
  if (!node) return ''
  const f = teaFilterStore.type
  if (f && node.byType && node.byType[f]) return node.byType[f]
  return node.general
})

const accent = computed(() =>
  teaFilterStore.type ? TEA_TYPE_COLOR[teaFilterStore.type] : 'var(--tea-amber)'
)
</script>

<template>
  <div class="insight-callout reveal" :style="{ '--accent': accent }">
    <div class="ic-mark">
      <span v-if="teaFilterStore.type" class="ic-tag" :style="{ background: accent }">{{ teaFilterStore.type }}</span>
      跨图洞察
    </div>
    <p class="ic-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.insight-callout {
  max-width: 720px;
  margin: 0 auto;
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  border-radius: 14px;
  padding: 16px 22px;
  box-shadow: var(--shadow-soft);
}
.ic-mark {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--serif);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--accent);
  margin-bottom: 8px;
}
.ic-tag {
  color: #fff;
  font-size: 11px;
  letter-spacing: 0;
  border-radius: 10px;
  padding: 1px 8px;
}
.ic-text {
  font-size: 14.5px;
  line-height: 1.85;
  color: var(--ink-soft);
}
</style>
