---
title: 'Lesson 4: Auth & Sessions'
description: 'Learn Keystone: Lesson 4'
---

Learn how to add passwords, session data and authentication to your Keystone app.

## Where we left off

In the [last lesson](/docs/walkthroughs/lesson-3) we setup a publishing workflow for blog posts and ended up with a keystone.js file that looks like:

```ts
//keystone.ts
import { list, config } from '@keystone-6/core'
import { text, timestamp, select, relationship } from '@keystone-6/core/fields'

const lists = {
  User: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
  Post: list({
    fields: {
      title: text(),
      publishedAt: timestamp(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
}

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',
  },
  lists,
})
```

We're now going to add auth to our app so that different types of users have access to different types of things.
While Keystone has very granular permissions controls, which you can read about [here](/docs/guides/auth-and-access-control), this lesson will stay focused on securing our Admin UI behind a password.

## Add the Password field

Keystone's [password](/docs/fields/password) field adheres to typical password security recommendations like hashing the password in the database, and masking the password for Admin UI input fields.

Let's add a password field to our `User` list so users can authenticate with Keystone:

```ts{2,10}[13-27,29-500]
import { list, config } from '@keystone-6/core';
import { password, text, timestamp, select, relationship } from '@keystone-6/core/fields';

const lists = {
  User: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
      password: password({ validation: { isRequired: true } })
    },
  }),
  Post: list({
    fields: {
      title: text(),
      publishedAt: timestamp(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
};

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',
  },
  lists,
});
```

That's all we need to store secure passwords in our database!

## Add Authentication

### Install the `auth` package

Authentication isn't built directly in to Keystone - it's an enhancement you can add on top. To use it in our app we need to add Keystone’s [auth package](https://github.com/keystonejs/keystone/tree/main/packages/auth):

```sh
npm install @keystone-6/auth
```

Now that we have the package, let’s create a new file in the root of our project to write our auth config in:

```sh
touch auth.ts
```

And add the following code:

```ts
// auth.ts
import { createAuth } from '@keystone-6/auth'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'name',
  secretField: 'password',
})

export { withAuth }
```

This code says:

- The `User` list is the list that auth should be applied to
- `email` and `password` will be the fields used to log a user in

### Add sessions

Having added an authentication method, we need to add a 'session', so that authentication can be kept between refreshes. Also in the auth file, we want to add:

```ts{3,12-500}[4-11]
// auth.ts
import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'name',
  secretField: 'password',
});

let sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
let sessionMaxAge = 60 * 60 * 24; // 24 hours

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});

export { withAuth, session }
```

### Import Auth & Sessions to Keystone config

Back over in our keystone file, we want to import our `withAuth` function, and our `session` object.

`withAuth` will wrap our default export and modify it as a last step in setting up our config. The session is attached to the export.

Finally, we need to add an `isAccessAllowed` function to our export so that only users with a valid session can see Admin UI:

```ts{4,32-33,39-42}[7-29]
//keystone.ts
import { list, config } from '@keystone-6/core';
import { password, text, timestamp, select, relationship } from '@keystone-6/core/fields';
import { withAuth, session } from './auth';

const lists = {
  User: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
      password: password({ validation: { isRequired: true } })
    },
  }),
  Post: list({
    fields: {
      title: text(),
      publishedAt: timestamp(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
};

export default config(
  withAuth({
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
  })
);
```

## Adding an initial user

With our new set-up, we'll be locked out of Admin UI if the database has no users. We can use `db.onConnect` to create an initial user with a random password and log the credentials when Keystone starts.

The creation runs in the background so it does not delay startup. This is convenient for development; production systems should use a secure provisioning process instead.

## What we have now

```ts
// auth.ts
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'name',
  secretField: 'password',
})

let sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'
let sessionMaxAge = 60 * 60 * 24 // 24 hours

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
})

export { withAuth, session }
```

```ts
//keystone.ts
import { list, config } from '@keystone-6/core'
import { password, text, timestamp, select, relationship } from '@keystone-6/core/fields'
import { withAuth, session } from './auth'

const lists = {
  User: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
      password: password({ validation: { isRequired: true } }),
    },
  }),
  Post: list({
    fields: {
      title: text(),
      publishedAt: timestamp(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
}

export default config(
  withAuth({
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
      async onConnect(context) {
        // this creates an initial user if none exist so you can log in for development
        // WARNING: do not use this in production
        ;(async () => {
          const sudoContext = context.sudo()
          if ((await sudoContext.db.User.count()) !== 0) return

          const password = crypto.getRandomValues(new Uint8Array(16)).toHex()
          await sudoContext.db.User.createOne({
            data: { name: 'admin', email: 'admin@example.com', password },
          })
          console.log(`Created initial user: admin@example.com / ${password}`)
        })().catch(error => console.error('Failed to create initial user:', error))
      },
    },
    lists,
    session,
    ui: {
      isAccessAllowed: context => !!context.session?.data,
    },
  })
)
```

## Next lesson

{% related-content %}
{% well
   heading="Lesson 5: Rich Text"
   grad="grad1"
   href="/docs/walkthroughs/lesson-5"
   target="" %}
Add a powerful `document` field to your app and learn how to
configure it to meet your needs
{% /well %}
{% /related-content %}
