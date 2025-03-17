import 'ant-design-vue/dist/reset.css'
import './assets/styles/main.scss'
import 'notivue/notification.css'
import 'notivue/animations.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'
import { register } from 'swiper/element/bundle'
import { useAuthStore } from './stores/useAuthStore'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(createNotivue())
app.use(pinia)
app.use(router)
register()

const authStore = useAuthStore()
    authStore.init().finally(() => {
    app.mount('#app')
})
