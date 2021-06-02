---
'@keystone-next/auth': major
'@keystone-next/keystone': major
'@keystone-next/website': patch
'@keystone-next/example-auth': patch
'@keystone-next/app-basic': patch
'@keystone-next/example-ecommerce': patch
'keystone-next-app': patch
'@keystone-next/example-roles': patch
'@keystone-next/api-tests-legacy': patch
---

Removed `withItemData` in favour of a `sessionData` option to the `createAuth()` function.

Previously, `withItemData` would be used to wrap the `config.session` argument:

```typescript
import { config, createSchema, list } from '@keystone-next/keystone/schema';
import { statelessSessions, withAuthData } from '@keystone-next/keystone/session';
import { text, password, checkbox } from '@keystone-next/fields';
import { createAuth } from '@keystone-next/auth';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
});

const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

export default withAuth(
  config({
    lists: createSchema({
      User: list({
        fields: {
          email: text({ isUnique: true }),
          password: password(),
          isAdmin: checkbox(),
        },
      }),
      session: withItemData(session, { User: 'id isAdmin' }),
    }),
  })
);
```

Now, the fields to populate are configured on `sessionData` in `createAuth`, and `withItemData` is completely removed.

```typescript
import { config, createSchema, list } from '@keystone-next/keystone/schema';
import { statelessSessions } from '@keystone-next/keystone/session';
import { text, password, checkbox } from '@keystone-next/fields';
import { createAuth } from '@keystone-next/auth';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id isAdmin',
});

const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

export default withAuth(
  config({
    lists: createSchema({
      User: list({
        fields: {
          email: text({ isUnique: true }),
          password: password(),
          isAdmin: checkbox(),
        },
      }),
      session,
    }),
  })
);
```
