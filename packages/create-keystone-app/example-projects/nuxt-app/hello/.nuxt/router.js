import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _17dac2ee = () => interopDefault(import('../../../../../../node_modules/@nuxt/vue-app/template/pages/index.vue' /* webpackChunkName: "" */))

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
      path: "",
      component: _17dac2ee
    }],

  fallback: false
}

export function createRouter() {
  return new Router(routerOptions)
}
