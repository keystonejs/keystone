<!--[meta]
section: guides
title: Production checklist
subSection: deployment
[meta]-->

# Production checklist

Yes, Keystone can be (and is!) used for production websites. Here's a handy list of tips for using Keystone with real workloads:

## Secure cookies

In production builds, [Keystone's `cookie` object](/packages/keystone/README.md#config) defaults to

```js
cookie = {
  secure: process.env.NODE_ENV === 'production', // Defaults to true in production
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  sameSite: false,
};
```

Make sure your server is HTTPS-enabled when `secure` is enabled or you will be unable to log in.

## Session handling

### Cookie secret

Make sure the production deployment sets a long, unguessable value for [Keystone's `cookieSecret`](/packages/keystone/README.md#config).

A randomly generated value is suitable (but keep it secret):

```shell
openssl rand -hex 32
```

### Session store

Sessions are stored inside the Keystone app by default, but in production it's recommended to store them in an external server such as Redis instead. You can use [any of the stores that work with `express session`](https://github.com/expressjs/session#compatible-session-stores). The advantages of using an external server are that

- You can restart your app for upgrades without breaking sessions
- You can replicate your Keystone app for availability, while keeping sessions consistent

This option can be set using the [sessionStore](/packages/keystone/README.md#sessionstore) property in the `Keystone` constructor configuration object.

## Caching

Improve performance and responsiveness by adding [cache hints](/docs/guides/cache-hints.md) to your lists, fields and custom queries.

## Access control

Configure [access control](/docs/guides/access-control.md) to limit who can do what with your data.

## DoS hardening

Add [query limits](/docs/api/create-list.md#querylimits) and [validation](/docs/api/validation.md) to protect your server against maliciously complex queries.

## Using reverse proxies

It's recommended to run production Javascript servers behind a reverse proxy such as [Nginx](https://nginx.org/), [HAProxy](https://www.haproxy.org/), a CDN or a cloud-based application (layer 7) load balancer. Doing that can improve performance and protect against [Slowloris Dos attacks](https://en.wikipedia.org/wiki/Slowloris_(computer_security)). The express application variable [`trust proxy`](https://expressjs.com/en/guide/behind-proxies.html) must be set to support reverse proxying:

```javascript title=index.js
module.exports = {
  configureExpress: app => {
    app.set('trust proxy', true);
  },
};
```

## Environment variables

Don't forget to set the `NODE_ENV` environment variable to `production` when running. Many `npm` libraries check this to enable production mode.

```shell
NODE_ENV=production keystone start
```

## Monitoring

If you care about your app, you'll want to know if something bad happens to it. There are many uptime monitoring service providers who'll regularly ping your app and notify you if it stops working.
