<!--[meta]
section: api
subSection: utilities
title: Email Sending
[meta]-->

# Email Sending

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

`index.js`

```javascript
const { emailSender } = require('@keystone-alpha/email');

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

`emails/new-user.jsx`

```javascript
const React = require('react');

module.exports = class extends React.Component {
  render() {
    return (
      <html>
        <body>
          <div>Hello {this.props.name}</div>
        </body>
      </html>
    );
  }
};
```

> NOTE: The `jsx` renderer has a peer dependency on `react` and `react-dom`

### mjml

There is support for [`mjml-react`](https://github.com/wix-incubator/mjml-react)
using the `mjml` renderer.

Usage:

`index.js`

```javascript
const { emailSender } = require('@keystone-alpha/email');

const mjmlEmailSender = emailSender.mjml({
  // The directory containing the email templates
  root: `${__dirname}/emails`,
  // The transport to send the emails (see `keystone-email` docs)
  transport: 'mailgun'
});

// NOTE: The `.jsx` extension is still used here
await mjmlEmailSender('new-user.jsx').send(
  { ... }, // renderer props
  { ... }, // transport options (api keys, to/from, etc). See `keystone-email` docs
);
```

`emails/new-user.jsx`

```javascript
const React = require('react');
const { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlText } = require('mjml-react');

module.exports = class extends React.Component {
  render() {
    return (
      <Mjml>
        <MjmlBody width={500}>
          <MjmlSection fullWidth backgroundColor="#efefef">
            <MjmlColumn>
              <MjmlText>Hello!</MjmlText>
            </MjmlColumn>
          </MjmlSection>
        </MjmlBody>
      </Mjml>
    );
  }
};
```

> NOTE: The `mjml` renderer has a peer dependency on `react`, `react-dom`, and `mjml-react`

### Pug (previously Jade)

Usage:

```javascript
const { emailSender } = require('@keystone-alpha/email');

const pugEmailSender = emailSender.pug({
  // The directory containing the email templates
  root: `${__dirname}/emails`,
  // The transport to send the emails (see `keystone-email` docs)
  transport: 'mailgun'
});

await pugEmailSender('new-user.pug').send(
  { ... }, // renderer props
  { ... }, // transport options (api keys, to/from, etc). See `keystone-email` docs
);
```

### Other renderers

Above are examples of using 2 renderers, `jsx`, and `pug`.

In general, renderers are available directly on the exported object:

```javascript
const { emailSender } = require('@keystone-alpha/email');

emailSender.<renderer>(...);
```

While you're able to access any renderer this way, not every package will work.
Under the hood, `keystone-email` will call `require(<renderer>)`, then use the
`__express` export. ie; any compatible express renderer should work as long as
it's in your dependencies.

See [`keystone-email`](https://github.com/keystonejs/keystone-email) for more.
