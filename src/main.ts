import 'ant-design-vue/dist/reset.css'
import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'
import { register } from 'swiper/element/bundle'

import 'notivue/notification.css'
import 'notivue/animations.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createNotivue())
app.use(createPinia())
app.use(router)
register()

app.mount('#app')
