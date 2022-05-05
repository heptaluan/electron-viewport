/**
 * Created by 9I
 * @Date 2022/4/21
 * @description
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/LoginPage.vue'
import MainPage  from '../views/MainPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/main',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router
