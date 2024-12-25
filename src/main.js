import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "quill/dist/quill.core.css";

createApp(App)
    .use(ElementPlus)
    .mount('#app')
