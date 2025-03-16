// import './assets/main.css'

import { createApp } from 'vue'
import '@/stores'
import pinia from './stores'
import App from './App.vue'
import router from './router'
// import 'element-plus/dist/index.css' // 引入默认样式
import './styles/element-variables.scss' // 引入自定义主题
import '@/assets/global.scss'
import '@/assets/icon/font_4638290_utufh6wf4gi/iconfont.css'
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
