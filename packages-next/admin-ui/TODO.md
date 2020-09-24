# TODO

- [x] Get the currently authenticated item (if keystone list sessions are used) @mitchell
  - [x] Make a hook to consume it (unlike the admin meta, I'm thinking we don't block rendering for fetching this)
  - [x] UI for "you're currently logged in as {label}"
- [ ] Generate Nav, and allow overrides in client-side config
- [ ] Need config for lists to say whether you should be able to create / edit things
- [ ] Add a SignOut page, as an esacape hatch if you need to sign out and don't have a button

## Dashboard

- [ ] Render cards on the dashboard based on nav
- [ ] Need to query (staic/dynamic) permissions before trying to show UI
  - [ ] I think this means we need to add more to the meta queries for lists
- [ ] Cards on the dashboard should\* show individual errors (but not access control errors)
- [ ] If you can create items, show the create button
- [ ] Unless it is switched off, show the current count by default
- [ ] Add a way for cards to be customised per-list (probably custom `views.DashboardCard` on the list)

## List View

- [ ] Need popups for columns and filters
- [ ] Implement Columns
  - [x] URL State working and actually setting columns
  - [x] Show the right columns in the table and query the right fields
  - [x] Show "with {x} columns" in UI
  - [ ] Popup to select columns
  - [ ] ~~Logic to ensure there's always a label or ID field~~
  - [ ] Add `supportsLinkTo` support to Cells
  - [ ] Pass `linkTo` to the first cell, if supported, otherwise add a link icon as the first column
- [ ] Implement Filters
  - [x] URL State working and actually filtering
  - [x] Show selected filters in UI
  - [ ] Popup to add filters
  - [ ] Popup to edit filters
- [x] Implement Pagination
- [ ] Selecting items
  - [ ] Selecting specific items in the table, with all/none
- [ ] Delete selected item(s)
- [ ] Add dots menu for [copy link / copy id / delete]
- [ ] Sorting

### Come back to later

- [ ] Select all items matching a filter (requires resolver support to implement)
- [ ] Update selected item(s) (this needs some thought around certain fields like relationships)

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
