import { stringify } from 'querystring'
import Vue from 'vue'
import fetch from 'node-fetch'
import middleware from './middleware.js'
import { applyAsyncData, getMatchedComponents, middlewareSeries, promisify, urlJoin, sanitizeComponent } from './utils.js'
import { createApp, NuxtError } from './index.js'
import NuxtLink from './components/nuxt-link.server.js' // should be included after ./index.js

// Component: <NuxtLink>
Vue.component(NuxtLink.name, NuxtLink)
Vue.component('NLink', NuxtLink)

if (!global.fetch) { global.fetch = fetch }

const noopApp = () => new Vue({ render: h => h('div') })

const createNext = ssrContext => (opts) => {
  ssrContext.redirected = opts
  // If nuxt generate
  if (!ssrContext.res) {
    ssrContext.nuxt.serverRendered = false
    return
  }
  opts.query = stringify(opts.query)
  opts.path = opts.path + (opts.query ? '?' + opts.query : '')
  const routerBase = '/'
  if (!opts.path.startsWith('http') && (routerBase !== '/' && !opts.path.startsWith(routerBase))) {
    opts.path = urlJoin(routerBase, opts.path)
  }
  // Avoid loop redirect
  if (opts.path === ssrContext.url) {
    ssrContext.redirected = false
    return
  }
  ssrContext.res.writeHead(opts.status, {
    'Location': opts.path
  })
  ssrContext.res.end()
}

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default async (ssrContext) => {
  // Create ssrContext.next for simulate next() of beforeEach() when wanted to redirect
  ssrContext.redirected = false
  ssrContext.next = createNext(ssrContext)
  // Used for beforeNuxtRender({ Components, nuxtState })
  ssrContext.beforeRenderFns = []
  // Nuxt object (window{{globals.context}}, defaults to window.__NUXT__)
  ssrContext.nuxt = { layout: 'default', data: [], error: null, serverRendered: true }
  // Create the app definition and the instance (created for each request)
  const { app, router } = await createApp(ssrContext)
  const _app = new Vue(app)

  // Add meta infos (used in renderer.js)
  ssrContext.meta = _app.$meta()
  // Keep asyncData for each matched component in ssrContext (used in app/utils.js via this.$ssrContext)
  ssrContext.asyncData = {}

  const beforeRender = async () => {
    // Call beforeNuxtRender() methods
    await Promise.all(ssrContext.beforeRenderFns.map(fn => promisify(fn, { Components, nuxtState: ssrContext.nuxt })))
    ssrContext.rendered = () => {
    }
  }
  const renderErrorPage = async () => {
    // Load layout for error page
    const errLayout = (typeof NuxtError.layout === 'function' ? NuxtError.layout(app.context) : NuxtError.layout)
    ssrContext.nuxt.layout = errLayout || 'default'
    await _app.loadLayout(errLayout)
    _app.setLayout(errLayout)
    await beforeRender()
    return _app
  }
  const render404Page = () => {
    app.context.error({ statusCode: 404, path: ssrContext.url, message: `This page could not be found` })
    return renderErrorPage()
  }

  const s = Date.now()

  // Components are already resolved by setContext -> getRouteData (app/utils.js)
  const Components = getMatchedComponents(router.match(ssrContext.url))

  /*
  ** Call global middleware (nuxt.config.js)
  */
  let midd = []
  midd = midd.map((name) => {
    if (typeof name === 'function') return name
    if (typeof middleware[name] !== 'function') {
      app.context.error({ statusCode: 500, message: 'Unknown middleware ' + name })
    }
    return middleware[name]
  })
  await middlewareSeries(midd, app.context)
  // ...If there is a redirect or an error, stop the process
  if (ssrContext.redirected) return noopApp()
  if (ssrContext.nuxt.error) return renderErrorPage()

  /*
  ** Set layout
  */
  let layout = Components.length ? Components[0].options.layout : NuxtError.layout
  if (typeof layout === 'function') layout = layout(app.context)
  await _app.loadLayout(layout)
  if (ssrContext.nuxt.error) return renderErrorPage()
  layout = _app.setLayout(layout)
  ssrContext.nuxt.layout = _app.layoutName

  /*
  ** Call middleware (layout + pages)
  */
  midd = []
  layout = sanitizeComponent(layout)
  if (layout.options.middleware) midd = midd.concat(layout.options.middleware)
  Components.forEach((Component) => {
    if (Component.options.middleware) {
      midd = midd.concat(Component.options.middleware)
    }
  })
  midd = midd.map((name) => {
    if (typeof name === 'function') return name
    if (typeof middleware[name] !== 'function') {
      app.context.error({ statusCode: 500, message: 'Unknown middleware ' + name })
    }
    return middleware[name]
  })
  await middlewareSeries(midd, app.context)
  // ...If there is a redirect or an error, stop the process
  if (ssrContext.redirected) return noopApp()
  if (ssrContext.nuxt.error) return renderErrorPage()

  /*
  ** Call .validate()
  */
  let isValid = true
  try {
    for (const Component of Components) {
      if (typeof Component.options.validate !== 'function') {
        continue
      }

      isValid = await Component.options.validate(app.context)

      if (!isValid) {
        break
      }
    }
  } catch (validationError) {
    // ...If .validate() threw an error
    app.context.error({
      statusCode: validationError.statusCode || '500',
      message: validationError.message
    })
    return renderErrorPage()
  }

  // ...If .validate() returned false
  if (!isValid) {
    // Don't server-render the page in generate mode
    if (ssrContext._generate) ssrContext.nuxt.serverRendered = false
    // Render a 404 error page
    return render404Page()
  }

  // If no Components found, returns 404
  if (!Components.length) return render404Page()

  // Call asyncData & fetch hooks on components matched by the route.
  const asyncDatas = await Promise.all(Components.map((Component) => {
    const promises = []

    // Call asyncData(context)
    if (Component.options.asyncData && typeof Component.options.asyncData === 'function') {
      const promise = promisify(Component.options.asyncData, app.context)
      promise.then((asyncDataResult) => {
        ssrContext.asyncData[Component.cid] = asyncDataResult
        applyAsyncData(Component)
        return asyncDataResult
      })
      promises.push(promise)
    } else {
      promises.push(null)
    }

    // Call fetch(context)
    if (Component.options.fetch) {
      promises.push(Component.options.fetch(app.context))
    } else {
      promises.push(null)
    }

    return Promise.all(promises)
  }))

  if (process.env.DEBUG && asyncDatas.length)console.debug('Data fetching ' + ssrContext.url + ': ' + (Date.now() - s) + 'ms')

  // datas are the first row of each
  ssrContext.nuxt.data = asyncDatas.map(r => r[0] || {})

  // ...If there is a redirect or an error, stop the process
  if (ssrContext.redirected) return noopApp()
  if (ssrContext.nuxt.error) return renderErrorPage()

  // Call beforeNuxtRender methods & add store state
  await beforeRender()

  return _app
}
