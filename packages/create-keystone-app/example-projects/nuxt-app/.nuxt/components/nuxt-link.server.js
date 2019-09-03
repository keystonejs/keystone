import Vue from 'vue'

export default {
  name: 'NuxtLink',
  extends: Vue.component('RouterLink'),
  props: {
    noPrefetch: {
      type: Boolean,
      default: false
    }
  }
}
