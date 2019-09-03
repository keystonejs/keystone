import Vue from 'vue'

const requestIdleCallback = window.requestIdleCallback ||
  function (cb) {
    const start = Date.now()
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start))
        }
      })
    }, 1)
  }
const observer = window.IntersectionObserver && new window.IntersectionObserver((entries) => {
  entries.forEach(({ intersectionRatio, target: link }) => {
    if (intersectionRatio <= 0) {
      return
    }
    link.__prefetch()
  })
})

export default {
  name: 'NuxtLink',
  extends: Vue.component('RouterLink'),
  props: {
    noPrefetch: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (!this.noPrefetch) {
      requestIdleCallback(this.observe, { timeout: 2e3 })
    }
  },
  beforeDestroy() {
    if (this.__observed) {
      observer.unobserve(this.$el)
      delete this.$el.__prefetch
    }
  },
  methods: {
    observe() {
      // If no IntersectionObserver, avoid prefetching
      if (!observer) {
        return
      }
      // Add to observer
      if (this.shouldPrefetch()) {
        this.$el.__prefetch = this.prefetch.bind(this)
        observer.observe(this.$el)
        this.__observed = true
      }
    },
    shouldPrefetch() {
      return this.getPrefetchComponents().length > 0
    },
    canPrefetch() {
      const conn = navigator.connection
      const hasBadConnection = this.$nuxt.isOffline || (conn && ((conn.effectiveType || '').includes('2g') || conn.saveData))

      return !hasBadConnection
    },
    getPrefetchComponents() {
      const ref = this.$router.resolve(this.to, this.$route, this.append)
      const Components = ref.resolved.matched.map(r => r.components.default)

      return Components.filter(Component => typeof Component === 'function' && !Component.options && !Component.__prefetched)
    },
    prefetch() {
      if (!this.canPrefetch()) {
        return
      }
      // Stop obersing this link (in case of internet connection changes)
      observer.unobserve(this.$el)
      const Components = this.getPrefetchComponents()

      for (const Component of Components) {
        const componentOrPromise = Component()
        if (componentOrPromise instanceof Promise) {
          componentOrPromise.catch(() => {})
        }
        Component.__prefetched = true
      }
    }
  }
}
