import { createApp } from 'vue'
import App from './App.vue'
import './samples/node-api'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './scss/index.scss'
// @ts-ignore
import router from "./router"

const app = createApp(App);
// app.config.productionTip = false;

app.use(Antd).use(router).mount('#app').$nextTick(window.removeLoading);
