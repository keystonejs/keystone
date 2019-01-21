# Email Sending in Voussoir

Send emails via various transports, rendered with Express-compatible
renderers.

Powered by [`keystone-email`](https://github.com/keystonejs/keystone-email).

## Transports

See [`keystone-email`](https://github.com/keystonejs/keystone-email) for supported
transports and options.

## Renderers

Express-compatible renderers should work out of the box
(as long as [they export an `__express` key](https://github.com/keystonejs/keystone-email/issues/8))

### React / jsx

There is a `jsx` renderer powered by `express-react-views`.

Usage:

```javascript
const emailSender = require('@voussoir/email');

const jsxEmailSender = emailSender.jsx({
  // The directory containing the email templates
  root: `${__dirname}/emails`,
  // The transport to send the emails (see `keystone-email` docs)
  transport: 'mailgun'
});

await jsxEmailSender('new-user.jsx').send(
  { ... }, // renderer props
  { ... }, // transport options (api keys, to/from, etc). See `keystone-email` docs
);
```

_NOTE: The `jsx` renderer has a peer dependency on `react` & `react-dom`_.

### Jade

Usage:

```javascript
const emailSender = require('@voussoir/email');

const jadeEmailSender = emailSender.jade({
  // The directory containing the email templates
  root: `${__dirname}/emails`,
  // The transport to send the emails (see `keystone-email` docs)
  transport: 'mailgun'
});

await jadeEmailSender('new-user.jade').send(
  { ... }, // renderer props
  { ... }, // transport options (api keys, to/from, etc). See `keystone-email` docs
);
```

### Other renderers

Above are examples of using 2 renderers, `jsx`, and `jade`.

In general, renderers are available directly on the exported object:

```javascript
const emailSender = require('@voussoir/email');

emailSender.<renderer>(...);
```

While you're able to access any renderer this way, not every package will work.
Under the hood, `keystone-email` will call `require(<renderer>)`, then use the
`__express` export. ie; any compatible express renderer should work as long as
it's in your dependencies.

See [`keystone-email`](https://github.com/keystonejs/keystone-email) for more.
