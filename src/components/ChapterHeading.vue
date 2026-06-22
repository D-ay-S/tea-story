<script setup>
defineProps({
  chapter: { type: String, default: '' },
  title: { type: String, required: true },
  en: { type: String, default: '' },
  lead: { type: String, default: '' },
})
</script>

<template>
  <header class="chapter-head reveal">
    <div class="chapter-no" v-if="chapter">{{ chapter }}</div>
    <h2 class="chapter-title">{{ title }}</h2>
    <p class="chapter-en" v-if="en">{{ en }}</p>
    <p class="chapter-lead" v-if="lead">{{ lead }}</p>
    <div class="chapter-rule"></div>
  </header>
</template>

<style scoped>
.chapter-head {
  max-width: 860px;
  margin: 0 auto 48px;
  text-align: center;
}
.chapter-no {
  font-family: var(--serif);
  font-size: 13px;
  letter-spacing: 0.5em;
  color: var(--tea-amber);
  text-transform: uppercase;
  margin-bottom: 18px;
}
.chapter-title {
  font-family: var(--brush);
  font-weight: 400;
  font-size: clamp(34px, 5.2vw, 58px);
  color: var(--ink);
  letter-spacing: 0.06em;
  line-height: 1.2;
}
.chapter-en {
  font-family: var(--serif);
  font-style: italic;
  font-size: 15px;
  color: var(--ink-faint);
  margin-top: 10px;
  letter-spacing: 0.08em;
}
.chapter-lead {
  font-size: 17px;
  color: var(--ink-soft);
  margin-top: 22px;
  line-height: 1.95;
}
.chapter-rule {
  width: 64px;
  height: 2px;
  margin: 30px auto 0;
  background: linear-gradient(90deg, transparent, var(--tea-amber), transparent);
}
@media (max-width: 720px) {
  .chapter-head { margin-bottom: 32px; }
  .chapter-lead { font-size: 15px; }
}
</style>
