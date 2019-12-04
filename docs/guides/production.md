<!--[meta]
section: guides
title: Production Readiness Checklist
subSection: deployment
[meta]-->

# Production Readiness Checklist

Yes, KeystoneJS can be (and is!) used for production websites. Here's a handy list of tips for using KeystoneJS with real workloads:

## Secure Cookies

In production builds, [KeystoneJS' `secureCookies`](/packages/keystone/README.md#config) defaults to true. Make sure your server is HTTPS-enabled when `secureCookies` is enabled or you will be unable to log in.

## Session Handling

### Cookie Secret

Make sure the production deployment sets a long, unguessable value for [KeystoneJS' `cookieSecret`](/packages/keystone/README.md#config).

A randomly generated value is suitable (but keep it secret):

```
openssl rand -hex 32
```

### Session Store

Sessions are stored inside the KeystoneJS app by default, but in production it's recommended to store them in an external server such as Redis instead. You can use [any of the stores that work with `express session`](https://github.com/expressjs/session#compatible-session-stores). The advantages of using an external server are that

- You can restart your app for upgrades without breaking sessions
- You can replicate your KeystoneJS app for availability, while keeping sessions consistent

This option [can be set](/packages/keystone/) in the `Keystone` constructor.

## Caching

Improve performance and responsiveness by adding cache hints to your [lists](/docs/api/create-list.md#cachehint) and [fields](/packages/fields/README.md#cachehint).

## Access Control

Configure [access control](/docs/guides/access-control.md) to limit who can do what with your data.

## DoS Hardening

Add [query limits](/docs/api/create-list.md#querylimits) and [validation](/docs/api/validation.md) to protect your server against maliciously complex queries.

## Using Reverse Proxies

NB: If you're using a third-party hosted environment, you might already be using a reverse proxy, but Keystone will need to be [configured for it](/packages/keystone/README.md#trustproxies).

It's recommended to run production Javascript servers behind a reverse proxy such as [Nginx](https://nginx.org/), [HAProxy](https://www.haproxy.org/), a CDN or a cloud-based application (layer 7) load balancer. Doing that can improve performance and protect against [Slowloris Dos attacks](https://en.wikipedia.org/wiki/Slowloris_(computer_security)).

## Environment Variables

Don't forget to set the `NODE_ENV` environment variable to `production` when running. Many `npm` libraries check this to enable production mode.

```
NODE_ENV=production keystone start
```

## Monitoring

If you care about your app, you'll want to know if something bad happens to it. There are many uptime monitoring service providers who'll regularly ping your app and notify you if it stops working.
