<!--[meta]
section: misc
title: Alert
[meta]-->

import { Alert } from './src';

# Arch Alert

#### TODO

- npm version
- build status

> Alert messages, or alerts, inform users of successful or pending actions. Use them sparingly. Don’t show more than one at a time.

This repository is a module of the full [arch-ui][source] repository.

## Install

This repository is distributed with [npm][npm]. After [installing npm][install-npm], you can install `@arch-ui/alert` with this command.

```
npm install --save @arch-ui/alert

# OR

yarn add @arch-ui/alert
```

## Usage

Import the component into your application.

```jsx
import { Alert } from '@arch-ui/alert';
```

To override the styles use the [`@arch-ui/theme` package][theme].

## Documentation

<!-- %docs -->

Alert messages, or alerts, inform users of successful or pending actions. Use them sparingly. Don't show more than one at a time.

## Default

Alert messages start off looking decently neutral—they're just light blue rounded rectangles.

```jsx
<Alert>Alert message goes here.</Alert>
```

<Alert>Alert message goes here.</Alert>

You can put multiple paragraphs of text in an alert—the last paragraph's bottom `margin` will be automatically override.

```jsx
<Alert>
  <p>
    This is a longer alert in its own paragraph. It ends up looking something like this. If we keep
    adding more text, it'll eventually wrap to a new line.
  </p>
  <p>And this is another paragraph.</p>
</Alert>
```

<Alert>
  <p>
    This is a longer alert in its own paragraph. It ends up looking something like this. If we keep
    adding more text, it'll eventually wrap to a new line.
  </p>
  <p>And this is another paragraph.</p>
</Alert>

Should the need arise, you can quickly space out your alert from surrounding content with an `AlertGroup` wrapper. _Note the extra top and bottom margin in the example below._

```jsx
import { Alert, AlertGroup } from '@arch-ui/alert';

<AlertGroup>
  <Alert>Alert message goes here.</Alert>
  <Alert>Alert message goes here.</Alert>
</AlertGroup>;
```

## Appearances

info
success
warning
danger

Add the appearance property `warning`, `danger`, or `success` to the alert to make it yellow, red, or green, respectively.

```jsx
<Alert appearance="warning">Alert message goes here.</Alert>
```

<Alert appearance="warning">Alert message goes here.</Alert>

```jsx
<Alert appearance="danger">Alert message goes here.</Alert>
```

<Alert appearance="danger">Alert message goes here.</Alert>

```jsx
<Alert appearance="success">Alert message goes here.</Alert>
```

<Alert appearance="success">Alert message goes here.</Alert>

## Variations

Alerts default to a `subtle` variant, but if you need to pack more punch, add the variant property `bold`.

```jsx
<Alert appearance="danger" variant="bold">
  Alert message goes here.
</Alert>
```

<Alert appearance="danger" variant="bold">
  Alert message goes here.
</Alert>

## Full width alert

An alert that is full width; removes border and border radius.

```jsx
<Alert isFullWidth>
  <Container>Full width alert.</Container>
</Alert>
```

<!-- %proptypes -->

<!-- %enddocs -->

## License

MIT © [Thinkmill](https://www.thinkmill.com.au/)

[source]: https://github.com/keystonejs/keystone/tree/master/packages/arch

[npm]: https://www.npmjs.com/package/@arch-ui/alert

[install-npm]: https://docs.npmjs.com/getting-started/installing-node

[theme]: http://npmjs.com/package/@arch-ui/theme
