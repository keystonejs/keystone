---
'@keystonejs/app-admin-ui': major
'@keystonejs/keystone': major
'@keystonejs/api-tests': patch
'@keystonejs/demo-project-blog': patch
'@keystonejs/demo-project-meetup': patch
'@keystonejs/auth-passport': patch
'@keystonejs/auth-password': patch
'create-keystone-app': patch
---

Moved authentication strategy setup and handling to List level.

`keystone.createAuthStrategy` has been deprecated. Auth strategies are now set when creating a list using the `authStrategies` config option. It takes takes strategy config objects keyed by strategy name. Additionally, auth strategy config options are no longer set via a `config` key, but rather on the same level as the `type` key.

`AdminUIApp.authStrategies` now takes a string in the format `<list>.<strategy>` instead of the auth strategy object directly.

`List.getAuthStrategy(name)` was added.

```js
const keystone = new Keystone({...});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    isAdmin: { type: Checkbox },
    password: { type: Password },
  },
  authStrategies: {
    password: {
      type: PasswordAuthStrategy
      // ... other strategy-specific config options ... //
    }
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({ enableDefaultRoute: true, authStrategy: 'User.password' }),
  ],
};
```