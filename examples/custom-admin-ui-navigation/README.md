## Feature Example - Custom Field View

This project demonstrates how to create a custom Navigation component for use in the Admin-UI. It builds on the [Task Manager](../task-manager) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).

You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## admin/config.ts

The project contains an `config.ts` file in the `/admin` directory at its root. Keystone looks for this file for component customisations, and expects the following export.

```typescript
export const components = {
  Logo,
  Navigation,
};
```

The exported components object is expected to have the following type signature:

```typescript
{
    Logo?: (props: {}) => ReactElement;
    Navigation?: (props: NavigationProps) => ReactElement;
}
```

Keystone conveniently exports an AdminConfig type for DX.

```typescript
import { AdminConfig } from '@keystone-next/types';
export const components: AdminConfig['components'] = {
  Logo,
  Navigation,
};
```

## NavigationProps

Keystone passes the following props to your custom Navigation component:

```typescript
   NavigationProps = {
    authenticatedItem: AuthenticatedItem,
    routes: { state: string, data: Array<{ path: string, label: string, key: string }> } | { state: 'error', error: string }
   }
```

### authenticatedItem prop

The authenticatedItem prop is a `Union` representative of the following possible authentication states:

```typescript
type AuthenticatedItem =
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; label: string; id: string; listKey: string }
  | { state: 'loading' }
  | { state: 'error'; error: Error | readonly [GraphQLError, ...GraphQLError[]] };
```

You will need to reasonably account for all of these states if you would like to role your own AuthenticatedItem component but that's out of the scope for this particular example.

### routes prop

The `routes` prop is also a `Union` comprising of an error state and a "success" state

```typescript
type Routes =
  | {
      state: string;
      data: Array<{
        path: string;
        label: string;
        key: string;
      }>;
    }
  | {
      state: 'error';
      error: string;
    };
```

The error state includes an `error` payload representing the error message, while the success state contains a `data` payload consisting of an aray of route objects containing the `path` (a URL to pass into the NavItem component) a `label` to be rendered as the innerText of the `NavItem` element, and a `key` for React.

The `data` payload will always contain a route to the `Dashboard` as its first entry.

## Navigation components

Keystone exports the following components to make creating your own custom Navigation component easier. These are:

- NavigationContainer: A generic container element that also includes rendering logic for the passed in authenticatedItem.
- ListNavItems: This component renders out a list of Nav Items with preconfigured route matching logic optimised for lists.
- NavItem: A thin styling and accessibility wrapper around the Next.js `Link` component.

### NavigationContainer

The NavigationContainer is responsible for rendering semantic markup and styles for the containing element around your navigation items.
It's also responsible for rendering out the `authenticatedItem` should it exist. It has the following prop signature:

```typescript
type NavigationContainerProps = {
  authenticatedItem: AuthenticatedItem;
  children: ReactNode;
};
```

Pass it the `authenticatedItem` from the `NavigationProps` for it to handle rendering logic around user signin.

```tsx
const CustomNavigation = ({ authenticatedItem }) => {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      {/* The rest of your Nav goes here */}
    </NavigationContainer>
  );
};
```

### ListNavItem

The ListNavItem component takes a `routes` object and rendes the array of routes into a list of NavItems. It has the following prop signature:

```typescript
{
    routes:  {
        state: string,
        data: Array<{
            path: string,
            label: string,
            key: string
        }>
    }   |
    {
        state: 'error',
        error: string
    }
}
```

### NavItem

The NavItem component has the following type signature:

```typescript
type NavItemProps = {
  children: ReactNode;
  href: string;
  isSelected?: boolean;
};
```

By default the `isSelected` value if left undefined, will be evaluated by the condition `router.pathname === href`, pass in isSelected if you have a custom condition or would like more granular control over the selected state of Navigation items.

See also the [Custom Navigation guide](httpes://keystonejs.com/docs/guides/custom-admin-ui-navigation).
