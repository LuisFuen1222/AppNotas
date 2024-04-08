import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import LoginView from './views/LoginView.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
