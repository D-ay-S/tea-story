import { createApp } from 'vue'
import './style.css'
// 全局注册 echarts-wordcloud，确保 wordCloud series 类型在任何图表初始化前可用
import 'echarts-wordcloud'
import App from './App.vue'

createApp(App).mount('#app')
