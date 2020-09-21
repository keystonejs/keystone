# TODO

- [x] Get the currently authenticated item (if keystone list sessions are used) @mitchell
  - [x] Make a hook to consume it (unlike the admin meta, I'm thinking we don't block rendering for fetching this)
  - [x] UI for "you're currently logged in as {label}"
- [ ] Generate Nav, and allow overrides in client-side config

## Dashboard

- [ ] Render cards on the dashboard based on nav
- [ ] Need to query (staic/dynamic) permissions before trying to show UI
  - [ ] I think this means we need to add more to the meta queries for lists
- [ ] Cards on the dashboard should\* show individual errors (but not access control)
- [ ] Need config for lists to say whether you should be able to create / edit things

## List View

- [ ] Need popups for columns and filters
- [ ] Implement Columns
  - [ ] URL State working and actually setting columns
- [ ] Implement Filters
  - [ ] URL State working and actually filtering

## Create Item

- [ ] Need Modals
- [ ] Render the form with default values from controllers
- [ ] Call the mutation to create items then navigate
- [ ] Handle client-side validation (see posts form extensions and checkbox controller)
- [ ] Handle errors (show the error message up the top for now)

## Edit Item

- [x] Add reset changes
- [x] Disable save & reset changes when there are no changes
- [x] Only send changed fields to API

## Fields

- [ ] Relationship views

## Backlog

- [ ] Figure out how the ApolloClient gets the right URI for the GraphQL API (come back to this if/when we do server rendering)
- [ ] We need to talk about Errors. What is the format?
  - [ ] Figure out all the different sorts of errors we have, will inform constraints

## Nav

```js
const nav = [
  {
    type: 'section',
    label: 'Content',
    children: [
      {
        type: 'list',
        label: 'Blog Posts',
        list: 'Post',
      },
      {
        type: 'page',
        label: 'Some Page',
        href: '/custom-page',
      },
    ],
  },
];
```

---

```js
const userIsAdmin = ({ session: { item: user } }) => user?.isAdmin;
const userIsItem = ({ existingItem, session: { item: user } } = {}) =>
  existingItem && existingItem.id === user?.id;
const userIdItemOrAdmin = ({ existingItem, session: { item: user } = {} }) =>
  user?.isAdmin || existingItem?.id === user?.id;

const User = list({
  access: {
    update: userIsItemOrAdmin,
    delete: userIsAdmin,
  },
  availableThings: {
    defaultColumns: [],
    availableColumns: [],
    update: session => session?.item?.isAdmin,
  },
  fields: {
    name: text({}),
    email: text({}),
    password: password({ access: { update: userIdItemOrAdmin } }),
    isAdmin: checkbox({ access: { update: ({ session: { item: user } }) => user?.isAdmin } }),
  },
});
```

```graphql
query {
  UserListMeta(id: 1) {
    access {
      create
      read
      update
      delete
    }
    fields {
      path
      access {
        create
        read
        update
      }
    }
  }
}
```
