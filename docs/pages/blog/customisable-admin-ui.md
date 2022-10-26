---
title: "Customisable Admin UI"
description: "Custom navigation, pages and logo in this big Admin UI themed release."
publishDate: "2021-7-29"
authorName: "Ronald Aveling"
authorHandle: "https://twitter.com/ronaldaveling"
metaImageUrl: ""
---

## Custom Admin UI Navigation 🚏

You can now create your own custom navigation component with custom routes to be rendered in the Admin UI.

Check out our detailed [Custom Admin UI Navigation guide](https://keystonejs.com/docs/guides/custom-admin-ui-navigation) for all the details!

![Custom navigation screenshot](https://user-images.githubusercontent.com/737821/127438549-621da3c6-1201-495b-ad2a-73328b834262.png)

## Custom Admin UI Pages 📃

Take things a step further with custom pages. As the Admin UI is built on top of Next.js, it exposes the same `/pages` directory for adding custom pages.

ℹ️ In the near future you'll be able to directly embed pages within the
Keystone Admin UI itself, stay tuned!

Read our new [Custom Admin UI Pages guide](https://keystonejs.com/docs/guides/custom-admin-ui-pages) for more details.

![Custom page screenshot](https://user-images.githubusercontent.com/737821/127438536-68617646-805e-4031-aced-b2f12c4190fb.png)

## Custom Admin UI Logo 🚩

Wait, there's more. You can also replace the default Admin UI logo with your own brand assets. ✨

Dive into our [Custom Admin UI Logo guide](https://keystonejs.com/docs/guides/custom-admin-ui-logo) to find out how.

![Animated logo screenshot](https://user-images.githubusercontent.com/737821/127438961-40bc6ddd-e34a-497d-ac6a-c135e88324d1.gif)

## Health Check 💙

We've added an optional `/_healthcheck` endpoint to Keystone's express server. You can use this endpoint to ensure your Keystone instance is up and running using website monitoring solutions.

Enable it by setting `config.server.healthCheck: true`, by default it will respond with `{ status: 'pass', timestamp: Date.now() }`.

You can also specify a custom path and JSON data:

```js
config({
  server: {
    healthCheck: {
      path: '/my-health-check',
      data: { status: 'healthy' },
    },
  },
});
```

Or use a function for the `data` config to return real-time information:

```js
config({
  server: {
    healthCheck: {
      path: '/my-health-check',
      data: () => ({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
      }),
    },
  },
});
```

You can view the [verbose release notes](https://github.com/keystonejs/keystone/releases/tag/2021-07-29) on GitHub.
