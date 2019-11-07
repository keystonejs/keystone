---
'@keystonejs/demo-project-blog': minor
'@keystonejs/app-admin-ui': minor
'@keystonejs/build-field-types': minor
---

Refactored the admin-ui custom pages feature.

You can now customise the admin-ui by creating a folder named `admin-ui` in your project directory or by specifying a path for hooks in the AdminUIApp constructor:

```
new AdminUIApp({
  hooks: require.resolve('./admin-folder/'),
});
```

The index file in the admin-ui directory exports an object, which for now should only include pages:

```
import Dashboard from './my-component/dashboard';

export default {
  pages: () => [
    {
      label: 'A new dashboard',
      path: '',
      component: Dashboard
    },
  ],
};
```

Hooks are now functions. The pages hook should be a function that returns an array of pages.

The shape of the pages array hasn't changed, except you can now include page components directly rather than with `require.resolve()`.

The old API will continue to work but will be deprecated in future.
