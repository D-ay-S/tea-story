# 一叶千里 · 中国茶叶数据叙事

将原先 5 个相互独立的可视化（手绘产地地图、六大茶类工艺、气候与产量关联、全球出口流向、人群消费洞察）**统一为一个 Vue 3 工程**，统一茶色调设计系统，并用一条"一片叶子的旅程"故事线串成一个长滚动网页。

## 故事线（五章）

| 章节 | 主题 | 可视化 | 原始来源 |
|------|------|--------|----------|
| 壹 一方水土 | 茶的产地与生态 | 中国地图散点 + 省份名茶面板 | datavis_page1.html |
| 贰 一叶六变 | 发酵工艺与成分 | 发酵度光谱 + 雷达图 + 工艺流程 | readme.md |
| 叁 天时考验 | 气候与产量关联 | 多轴折线 + 极端天气弹窗 + Pearson 系数 | index-v9.html |
| 肆 香飘四海 | 全球出口流向 | 3D 地球 lines3D + 年份轴 + 占比饼图 | UI3.jsx |
| 伍 当代茶饮 | 人群消费洞察 | 堆叠柱状 + 词云 + 洞察卡片 | TeaInsightPage 等 |

## 技术栈

- **Vue 3**（`<script setup>` 组合式 API）
- **Vite** 构建
- **ECharts 5** + `echarts-gl`（3D 地球）+ `echarts-wordcloud`（词云）
- 共享设计令牌（`src/style.css` 中的 CSS 变量）+ 滚动入场动画（`useReveal`）

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建，产物在 dist/
npm run preview  # 预览构建结果
```

## 目录结构

```
src/
├── App.vue                 # 长滚动叙事主页（导航 / Hero / 五章 / 衔接缝 / 尾声）
├── main.js
├── style.css               # 全局茶色调设计令牌
├── composables/
│   └── useReveal.js        # 滚动进入视口的入场动画
├── components/
│   ├── BaseChart.vue       # 通用 ECharts 封装（支持按需加载 gl / wordcloud）
│   ├── ChapterHeading.vue  # 统一章节标题
│   ├── SectionOrigin.vue   # 壹 · 产地地图
│   ├── SectionProcess.vue  # 贰 · 六大茶类
│   ├── SectionClimate.vue  # 叁 · 气候关联
│   ├── SectionExport.vue   # 肆 · 出口流向
│   └── SectionInsight.vue  # 伍 · 人群洞察
└── data/                   # 各章数据已抽离为独立模块
    ├── origins.js
    ├── sixTeas.js
    ├── climate.js
    ├── exports.js
    └── insight.js
```

## 统一化的几处关键调整

1. **设计统一**：所有模块改用同一套茶色调 CSS 变量（宣纸底、墨色字、琥珀/茶绿/茶红强调），字体统一为毛笔体（Ma Shan Zheng）做标题 + 思源宋体正文。
2. **格式统一**：原本混用 React(jsx/tsx) + 纯 HTML/JS，现全部改写为 Vue 3 单文件组件；图表统一经 `BaseChart.vue` 渲染。
3. **数据抽离**：所有内嵌数据迁移到 `src/data/`，便于后续替换为后端接口。
4. **故事线**：Hero → 引子 → 五章（每章之间有过渡"衔接缝"承接上下文）→ 尾声，构成"一片叶子从出生到走向世界与人群"的完整叙事。
5. **3D 地球纹理**：附带程序化生成的茶色地球贴图 `public/image/earth.jpg`，开箱即用、无需外部图源；地图底图仍按原实现从 DataV CDN 加载 GeoJSON（需联网）。

> 出口数据在原 React 版本基础上补充了美国、日本、德国等节点，使全球流向更完整；其余数据均沿用原文件。
