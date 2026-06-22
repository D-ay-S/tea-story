<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useReveal } from './composables/useReveal.js'
import ChapterHeading from './components/ChapterHeading.vue'
import SectionOrigin from './components/SectionOrigin.vue'
import SectionProcess from './components/SectionProcess.vue'
import SectionClimate from './components/SectionClimate.vue'
import SectionExport from './components/SectionExport.vue'
import SectionInsight from './components/SectionInsight.vue'
import GlobalTimeline from './components/GlobalTimeline.vue'
import TeaFilterBar from './components/TeaFilterBar.vue'
import InsightCallout from './components/InsightCallout.vue'

const root = ref(null)
useReveal(root)

const chapters = [
  { id: 'origin', no: '壹', label: '一方水土' },
  { id: 'process', no: '贰', label: '一叶六变' },
  { id: 'climate', no: '叁', label: '天时考验' },
  { id: 'export', no: '肆', label: '香飘四海' },
  { id: 'insight', no: '伍', label: '当代茶饮' },
]

// 当前章节（scroll-spy）：滚动到哪一章，顶部导航对应项高亮
const activeChapter = ref('')
let spy = null

onMounted(() => {
  const sections = chapters
    .map((c) => document.getElementById(c.id))
    .filter(Boolean)

  spy = new IntersectionObserver(
    (entries) => {
      // 取当前与视口交叉最多、且在中部区域的章节
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible.length) activeChapter.value = visible[0].target.id
    },
    {
      // 以视口中部一条带作为判定区，章节标题进入中部即高亮
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    }
  )
  sections.forEach((s) => spy.observe(s))
})

onBeforeUnmount(() => spy && spy.disconnect())

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div ref="root" class="page">
    <!-- 顶部导航 -->
    <nav class="nav">
      <div class="brand" @click="scrollTo('hero')">一叶千里</div>
      <ul>
        <li
          v-for="c in chapters"
          :key="c.id"
          :class="{ active: activeChapter === c.id }"
          @click="scrollTo(c.id)"
        >
          <span class="n">{{ c.no }}</span>{{ c.label }}
        </li>
      </ul>
    </nav>

    <!-- 全局茶类主线筛选 -->
    <TeaFilterBar />

    <!-- HERO -->
    <header id="hero" class="hero">
      <div class="hero-bg"></div>
      <div class="hero-inner">
        <p class="hero-kicker reveal">CHINA TEA · A DATA STORY</p>
        <h1 class="hero-title reveal delay-1">一<span class="ink-leaf">叶</span>千里</h1>
        <p class="hero-sub reveal delay-2">
          从一片茶叶的出身，到它走过的山川、岁月与人间——<br />
          一场关于中国茶的多维数据叙事
        </p>
        <div class="hero-dots reveal delay-3">
          <span v-for="c in chapters" :key="c.id">{{ c.no }}</span>
        </div>
        <div class="scroll-cue reveal delay-3" @click="scrollTo('intro')">
          <span>向下展卷</span>
          <i></i>
        </div>
      </div>
    </header>

    <!-- 故事引子 -->
    <section id="intro" class="intro">
      <p class="reveal">
        茶，生于山野，成于人手，行于四海。
      </p>
      <p class="reveal delay-1">
        我们用五组数据，串起它的一生：它<b>从何处生长</b>，又如何在制茶人手中
        <b>转化为六种风味</b>；它如何在<b>天时的恩泽与无常</b>中起伏，怎样
        <b>漂洋过海</b>抵达异国的茶杯，又如何被<b>当代不同人群</b>重新理解与饮用。
      </p>
      <p class="reveal delay-2">五章既是数据，也是一片叶子的旅程。</p>
    </section>

    <!-- 第一章 产地 -->
    <section id="origin" class="chapter">
      <ChapterHeading
        chapter="壹 · Origin"
        title="一方水土，一种茶"
        en="Where the Leaf Is Born"
        lead="茶树的风味，先由它脚下的土地写就。海拔、土壤、品种与气候，孕育出各省各异的名茶。拖动下方年份轴可看 2006–2025 各产地产量的变化——本图与第三章「气候」、第四章「出口」、第五章「人群」共享同一条时间轴，任意一处拖动，四图同步。点开省份看一片叶子最初的籍贯。"
      />
      <SectionOrigin />
    </section>

    <div class="seam"><span>叶子离开枝头，被送入制茶人的手中——</span></div>
    <InsightCallout slot="originProcess" />

    <!-- 第二章 工艺 -->
    <section id="process" class="chapter alt">
      <ChapterHeading
        chapter="贰 · Craft"
        title="一叶六变，发酵成谱"
        en="Six Transformations of One Leaf"
        lead="同一片鲜叶，因发酵程度与工序不同，化作绿、白、黄、青、红、黑六大茶类。发酵越深，茶多酚转化为茶红素，风味由清鲜走向醇厚。"
      />
      <SectionProcess />
    </section>

    <div class="seam"><span>风味既定，下一道考验来自天空——</span></div>
    <InsightCallout slot="processClimate" />

    <!-- 第三章 气候 -->
    <section id="climate" class="chapter">
      <ChapterHeading
        chapter="叁 · Climate"
        title="天时律动，产量起伏"
        en="The Sky Decides the Harvest"
        lead="一场倒春寒、一次百年大旱，都可能让春茶减产、价格飙升。二十年间的气温、降水与产量曲线背后，是制茶人无法回避的天时。图中琥珀色竖线标出当前联动年份，点击任意年份即可让四张图一同切换。"
      />
      <SectionClimate />
    </section>

    <div class="seam"><span>渡过天时，好茶开始走向更远的地方——</span></div>
    <InsightCallout slot="climateExport" />

    <!-- 第四章 出口 -->
    <section id="export" class="chapter alt">
      <ChapterHeading
        chapter="肆 · Export"
        title="香飘四海，流向全球"
        en="A Cup That Travels the World"
        lead="从北京出发，中国茶沿着贸易的航线流向俄罗斯、非洲、美洲与东亚。不同国度偏爱不同茶类——红茶、绿茶各有归处。左侧 3D 地球可旋转俯瞰，右侧平面地图一览全球流向，两图共享年份并与全站联动，可对照同一年的国内产量、气候与海外流向。"
      />
      <SectionExport />
    </section>

    <div class="seam"><span>而在故乡的城市里，茶正被新一代重新饮用——</span></div>
    <InsightCallout slot="exportInsight" />

    <!-- 第五章 人群 -->
    <section id="insight" class="chapter">
      <ChapterHeading
        chapter="伍 · People"
        title="当代茶饮，人群百态"
        en="Profiles of a New Tea Era"
        lead="Z世代追逐颜值与冷泡果香，新中产看重原产地与文化，银发族钟情养生与耐泡。人群偏好与词云热度都会随联动年份变化——拖动任意一张图的时间轴，看二十年间代际口味的迁移。点击柱状人群，词云会讲出他们各自的心事。"
      />
      <SectionInsight />
    </section>

    <!-- 尾声 -->
    <footer class="outro">
      <p class="reveal">一片叶子，走过了山川、岁月、海洋与人心。</p>
      <p class="reveal delay-1 brush">一叶千里 · 终</p>
      <p class="reveal delay-2 credit">
        数据可视化叙事 · 统一 Vue 3 + ECharts 实现 · 茶色调设计系统
      </p>
    </footer>

    <!-- 全局联动时间轴（固定底部，任意章节均可拉动） -->
    <GlobalTimeline />
  </div>
</template>

<style scoped>
.page { width: 100%; overflow-x: hidden; }

/* 导航 */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  background: rgba(246, 239, 226, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.brand { font-family: var(--brush); font-size: 24px; color: var(--tea-amber-d); cursor: pointer; letter-spacing: 2px; }
.nav ul { list-style: none; display: flex; gap: 6px; }
.nav li {
  cursor: pointer;
  font-family: var(--serif);
  font-size: 14px;
  color: var(--ink-soft);
  padding: 6px 14px;
  border-radius: 20px;
  transition: all 0.2s;
}
.nav li:hover { background: var(--tea-amber); color: #fff; }
.nav li .n { color: var(--tea-amber); margin-right: 6px; font-weight: 700; }
.nav li:hover .n { color: #fff; }
.nav li.active {
  background: var(--tea-amber);
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(197, 127, 58, 0.5);
}
.nav li.active .n { color: #fff; }

/* HERO */
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 25%, rgba(197, 127, 58, 0.16), transparent 42%),
    radial-gradient(circle at 72% 70%, rgba(79, 107, 88, 0.18), transparent 46%),
    linear-gradient(160deg, #f8f1e3, #efe3cf);
}
.hero-bg::after {
  content: '茶';
  position: absolute;
  right: -4%;
  bottom: -16%;
  font-family: var(--brush);
  font-size: 52vh;
  color: rgba(162, 101, 47, 0.06);
  line-height: 1;
  pointer-events: none;
}
.hero-inner { position: relative; z-index: 2; padding: 0 24px; }
.hero-kicker { font-family: var(--serif); letter-spacing: 0.55em; font-size: 13px; color: var(--tea-amber-d); margin-bottom: 26px; }
.hero-title {
  font-family: var(--brush);
  font-weight: 400;
  font-size: clamp(72px, 16vw, 180px);
  color: var(--ink);
  line-height: 1;
  letter-spacing: 0.04em;
}
.ink-leaf { color: var(--tea-green); }
.hero-sub { font-family: var(--serif); font-size: clamp(15px, 2.2vw, 20px); color: var(--ink-soft); margin-top: 30px; line-height: 2; }
.hero-dots { display: flex; gap: 16px; justify-content: center; margin-top: 40px; }
.hero-dots span {
  width: 40px;
  height: 40px;
  border: 1px solid var(--tea-amber);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--brush);
  color: var(--tea-amber-d);
  font-size: 18px;
}
.scroll-cue { margin-top: 46px; cursor: pointer; color: var(--ink-soft); font-family: var(--serif); font-size: 13px; letter-spacing: 0.3em; }
.scroll-cue i {
  display: block;
  width: 1px;
  height: 36px;
  margin: 12px auto 0;
  background: var(--tea-amber);
  animation: drop 1.8s ease-in-out infinite;
}
@keyframes drop {
  0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
  40% { transform: scaleY(1); transform-origin: top; opacity: 1; }
  60% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
  100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
}

/* 引子 */
.intro {
  max-width: 760px;
  margin: 0 auto;
  padding: 110px 28px 60px;
  text-align: center;
}
.intro p { font-family: var(--serif); font-size: clamp(17px, 2.4vw, 22px); color: var(--ink-soft); line-height: 2.1; margin-bottom: 26px; }
.intro b { color: var(--tea-amber-d); font-weight: 600; }

/* 章节 */
.chapter { padding: 90px 28px; }
.chapter.alt { background: linear-gradient(180deg, rgba(79, 107, 88, 0.04), rgba(197, 127, 58, 0.03)); }

/* 章节衔接缝 */
.seam {
  text-align: center;
  padding: 26px;
}
.seam span {
  font-family: var(--serif);
  font-style: italic;
  color: var(--ink-faint);
  font-size: 15px;
  position: relative;
}
.seam span::before, .seam span::after {
  content: '';
  display: inline-block;
  width: 38px;
  height: 1px;
  background: var(--tea-amber);
  vertical-align: middle;
  margin: 0 16px;
  opacity: 0.5;
}

/* 尾声 */
.outro {
  text-align: center;
  padding: 100px 28px 180px;
  background: linear-gradient(180deg, transparent, rgba(162, 101, 47, 0.07));
}
.outro p { font-family: var(--serif); color: var(--ink-soft); font-size: 18px; margin-bottom: 18px; }
.outro .brush { font-family: var(--brush); font-size: 46px; color: var(--tea-amber-d); margin: 24px 0; }
.outro .credit { font-size: 12.5px; color: var(--ink-faint); letter-spacing: 0.5px; }

@media (max-width: 820px) {
  .nav ul { display: none; }
  .chapter { padding: 64px 16px; }
}
</style>
