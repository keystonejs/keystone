# TODO

- [x] Get the currently authenticated item (if keystone list sessions are used) @mitchell
  - [x] Make a hook to consume it (unlike the admin meta, I'm thinking we don't block rendering for fetching this)
  - [x] UI for "you're currently logged in as {label}"
- [ ] Generate Nav, and allow overrides in client-side config
- [ ] Need config for lists to say whether you should be able to create / edit things
- [ ] Add a SignOut page, as an esacape hatch if you need to sign out and don't have a button
- [ ] Validate the user can access the admin when you sign in, for a smoother error experience
- [ ] Add a 'hidden' option for fields that hides them in the Admin UI

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
  - [x] Selection UI without popup
  - [x] Hide hidden fields from the selection ui
  - [ ] Popup to select columns (w/ search)
  - [ ] Don't show the popup when there are no columns to select from
  - [x] Add `supportsLinkTo` support to Cells
  - [x] Pass `linkTo` to the first cell, if supported, otherwise add a link icon as the first column
- [ ] Implement Filters
  - [x] URL State working and actually filtering
  - [x] Show selected filters in UI
  - [ ] Add filter UI outside of popup
  - [ ] Edit filter UI outside of popup
  - [ ] Popup to add filters (w/ search, exclude set filters)
  - [ ] Popup to edit filters
  - [ ] All the filter UI
- [x] Implement Pagination
- [x] Selecting items
  - [x] Selecting specific items in the table, with all/none
- [x] Delete selected item(s)
- [ ] Add dots menu for [copy link / copy id / delete]
- [x] Sorting
- [x] Show ~~access control~~ errors in columns
- [x] Fix style of link icon (when the first column is not linkable)
- [x] Fix columns widths for select / navigate
- [ ] Fix style of pagination at the bottom of the list
- [x] Add "Showing x of {total}" count to header when there is more than one page of items
- [ ] Add support for field types determining column width (needs discussion)
- [x] Handle the case where there are no fields to display
  - If you select no fields in the URL, we use the initialColumns, defaults to `_label_`
  - Whichever fields are selected, we filter out ones that are hidden
  - If you have no fields to display at all, we show `_label_`
- [x] Work out whether the label has been defaulted to `Id` and if so, show it in fixed-width font
  - When there is no `labelResolver` on the list, and no `name` field

### Come back to later

- [ ] Select all items matching a filter (requires resolver support to implement)
- [ ] Update selected item(s) (this needs some thought around certain fields like relationships)

## Create Item

- [ ] Need Modals
- [x] Render the form with default values from controllers
- [x] Call the mutation to create items then navigate
- [ ] Handle client-side validation (see posts form extensions and checkbox controller)
- [x] Handle errors (show the error message up the top for now)
- [ ] Handle the case where there are no editable fields in the create screen (needs discussion)
- [ ] Implement autoCreate feature (where you can create a new item without user input)

## Edit Item

- [x] Add reset changes
- [x] Disable save & reset changes when there are no changes
- [x] Only send changed fields to API
- [ ] Fix page styles & navigation
- [x] Render the item title as the header
- [ ] Implement sticky toolbar
- [x] Implement Delete Item
- [x] Copy ItemID to Clipboard
- [ ] Show access control errors for fields
- [x] ~~Handle the case where there are no editable fields (disable button, w/ tooltip)~~ (users won't be able to edit anything and then the button will have a tooltip saying something like "nothing has changed so you can't save")
- [x] Handle the case where there are no visible fields (show a message)

## Fields

- [ ] Relationship views
- [ ] Password views

- [ ] Client-side validation API for fields
- [ ] DependsOn field dependencies
- [x] Show proper field label (currently path)
- [ ] Show required status for fields
- [ ] Show descriptions under fields
- [ ] Standardise the components for rendering common field UI (label, description, etc)

## Backlog

- [ ] Figure out how the ApolloClient gets the right URI for the GraphQL API (come back to this if/when we do server rendering)
- [ ] Implement allowing access to the Admin UI without a valid session (in read only mode? etc -- this is going to be quite involved)
- [ ] We need to talk about Errors. What is the format?
  - [ ] Figure out all the different sorts of errors we have, will inform constraints
  - [ ] Show errors related to fields after server-side validation

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
