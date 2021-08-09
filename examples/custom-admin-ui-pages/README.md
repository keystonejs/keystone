## Feature Example - Custom Components for the Admin UI

This project demonstrates how to create a custom page in the Admin UI.
It builds on the [Task Manager](../task-manager) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).

You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

🚀 Congratulations, you're now up and running with Keystone!

## /admin/pages

This project leverages the `/admin/pages` directory. As elaborated on in the [Custom Pages](https://keystonejs.com/docs/guides/custom-admin-ui-pages) guide, this directory is used to generate additional pages in the Admin UI, a behaviour inherited from `Next.js`. The default export of files in this directory are expected to be **React Components**.
**All other exports are ignored**

**NOTE**: The Keystone monorepo leverages a babel config that means we use the old jsx transform (this doesn't have an impact on the code we ship to npm).
This is why there are `import React from 'react'` statements in our examples, this is NOT necessary outside of the Keystone repo (unless you have a babel config with the old jsx transform which is currently the default with `@babel/preset-react`) as you'll be using Next's babel config which uses the new jsx transform.

## Custom Navigation

In order to ensure that the new page is visible and navigable within the Admin UI, this example also adds a custom Navigation component with the
route to the custom page included. For much more detail on adding custom navigation, please see the Custom Admin UI Navigation [guide](https://keystonejs.com/docs/guides/custom-admin-ui-navigation) and [example](../custom-admin-ui-navigation).

## Layout components

In order to help us build custom pages that _look_ and _feel_ like part of the Admin UI, Keystone exports the `PageContainer` component from
the `@keystone-next/keystone/admin-ui/components` package.

### PageContainer

PageContainer has the following types:

```typescript
type PageContainerProps = {
  header: ReactElement;
  children: ReactNode;
};
```

To match the header style applied to all Admin UI standard pages, we use the `Heading` component from `@keystone-ui/core` as an `h3` element.

```tsx
import { PageContainer } from '@keystone-next/keystone/admin-ui/component';
import { Heading } from '@keystone-ui/core';

export default () => {
  return (
    <PageContainer header={<Heading type="h3">Custom Page</Heading>}>{/* ... */}</PageContainer>
  );
};
```
