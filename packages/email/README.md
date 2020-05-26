<!--[meta]
section: api
subSection: utilities
title: Keystone email
[meta]-->

# Keystone email

Send emails via various transports, rendered with Express-compatible
renderers. Powered by [`keystone-email`](https://github.com/keystonejs/keystone-email).

## Installation

```shell allowCopy=false showLanguage=false
yarn add @keystonejs/email
# or
npm install @keystonejs/email
```

## Transports

See [`keystone-email`](https://github.com/keystonejs/keystone-email) for supported
transports and options.

## Renderers

Express-compatible renderers should work out of the box
(as long as [they export an `__express` key](https://github.com/keystonejs/keystone-email/issues/8))

### React / jsx

There is a `jsx` renderer powered by `express-react-views`.

```javascript title=/emails/index.js
const { emailSender } = require('@keystonejs/email');

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

```jsx title=/emails/new-user.jsx
const React = require('react');

const UserTemplate = ({ name }) => {
  return (
    <html>
      <body>
        <div>Hello {name}</div>
      </body>
    </html>
  );
};

module.exports = UserTemplate;
```

> **Note:** The `jsx` renderer has a peer dependency on `react` and `react-dom`

### mjml

There is support for [`mjml-react`](https://github.com/wix-incubator/mjml-react)
using the `mjml` renderer.

```javascript title=/emails/index.js
const { emailSender } = require('@keystonejs/email');

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

```jsx title=/emails/new-user.jsx
const React = require('react');
const { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlText } = require('mjml-react');

const UserTemplate = ({ name }) => {
  return (
    <Mjml>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#efefef">
          <MjmlColumn>
            <MjmlText>Hello {name}!</MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

module.exports = UserTemplate;
```

> **Note:** The `mjml` renderer has a peer dependency on `react`, `react-dom`, and `mjml-react`

### Pug (previously Jade)

```javascript title=/emails/index.js
const { emailSender } = require('@keystonejs/email');

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

```javascript title=/emails/index.js
const { emailSender } = require('@keystonejs/email');

emailSender.<renderer>(...);
```

While you're able to access any renderer this way, not every package will work.
Under the hood, `keystone-email` will call `require(<renderer>)`, then use the
`__express` export. ie; any compatible express renderer should work as long as
it's in your dependencies.

See [`keystone-email`](https://github.com/keystonejs/keystone-email) for more.
