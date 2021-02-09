# TODO

- [x] Get the currently authenticated item (if keystone list sessions are used) @mitchell
  - [x] Make a hook to consume it (unlike the admin meta, I'm thinking we don't block rendering for fetching this)
  - [x] UI for "you're currently logged in as {label}"
- [x] Need config for lists to say whether you should be able to create / edit things
- [x] Add a 'hidden' fieldMode for fields that hides them in the Admin UI
- [x] Add an isHidden option for lists
  - [x] Hides the list in the nav
  - [x] Hides the card in the dashboard
- [ ] Merge custom field views into the default field views
- [ ] Add an example that implements custom fields
- [x] `idField` option
  - [x] autoIncrement in fields package
  - [x] mongoId in fields package
  - [x] `idField` option
  - [x] disallow `id` field in fields object
  - [x] default `idField` to `autoIncrement` for Knex & Prisma and `mongoId` for Mongoose with fieldMode: 'hidden' for itemView and createView
- [x] Remove usage of label field in Admin UI and remove it from the GraphQL schema(~~with a feature flag to turn it back on~~ and allow Keystone fields named `_label_` so users can create a virtual field for `_label_`)
- [ ] Ensure support for field descriptions in the create and item views
- [ ] Figure out what to support for custom list views
- [ ] Check in on custom pages
- [ ] Add an option to hide the GitHub and GraphQL links in the nav
- [ ] Generate Nav, and allow overrides in client-side config
- [ ] Add a SignOut page, as an esacape hatch if you need to sign out and don't have a button
- [ ] Validate the user can access the admin when you sign in, for a smoother error experience

## Design System Components

- [x] Drawer Package
- [x] Modals (specifically, confirm)
- [ ] Calendar / DateTime Picker
- [x] Toasts
- [x] Select (react-select in fields package, replaces SelectInput, doesn't expose customisation for styles and components)

## Dashboard

- [x] Cards on the dashboard should show individual errors
- [x] Cards on the dashboard should show individual loading states
- [x] If you can create items (!hideCreate) show the create button
- [ ] Add an option to override the fetching the item count for dashboard cards with a custom description (or hide it)
- [ ] Show list description in the card?
- [ ] Add a custom component to replace the dashboard
- [ ] Add a way for cards to be customised per-list (probably custom `views.DashboardCard` on the list)
- [ ] Add a way to replace the Dashboard with your own component
- [ ] Render cards on the dashboard based on nav

## List View

- [ ] Figure out what we're doing about search
- [x] Remember the last set of filters, columns, and sort in the List view in LocalStorage
- [x] Need popups for columns and filters
  - [x] Uses a highly customised react-select
- [x] Implement Columns
  - [x] URL State working and actually setting columns
  - [x] Show the right columns in the table and query the right fields
  - [x] Show "with {x} columns" in UI
  - [x] Selection UI without popup
  - [x] Hide hidden fields from the selection ui
  - [x] Popup to select columns (w/ search)
  - [x] Add `supportsLinkTo` support to Cells
  - [x] Pass `linkTo` to the first cell, if supported, otherwise add a link icon as the first column
- [x] Implement Filters
  - [x] URL State working and actually filtering
  - [x] Show selected filters in UI
  - [x] Allow async fetching of related item labels in relationship filters (make it a component instead of a function returning a string)
  - [x] Add filter UI outside of popup
  - [x] Edit filter UI outside of popup
  - [x] Popup to add filters (w/ search, exclude set filters)
  - [x] Popup to edit filters
- [x] Implement Pagination
- [x] Selecting items
  - [x] Selecting specific items in the table, with all/none
- [x] Delete selected item(s)
- [x] Sorting
  - [x] Implement sorting state (in url)
  - [x] Sort by clicking column headers
  - [x] Show which field the list is sorted by in the "showing x items..." description
  - [x] Add dropdown for selecting the field to sort on
  - [x] Handle when there are no fields to sort by
  - [x] Use `initialSort` config option (defaults to name, or no field)
- [x] Show ~~access control~~ errors in columns
- [x] Fix style of link icon (when the first column is not linkable)
- [x] Fix columns widths for select / navigate
- [ ] Fix style of pagination at the bottom of the list
- [x] Add "Showing x of {total}" count to header when there is more than one page of items
- [x] Handle the case where there are no fields to display
  - If you select no fields in the URL, we use the initialColumns, defaults to `_label_`
  - Whichever fields are selected, we filter out ones that are hidden
  - If you have no fields to display at all, we show `_label_`
- [x] Work out whether the label has been defaulted to `Id` and if so, show it in fixed-width font
  - When there is no `labelResolver` on the list, and no `name` field
- [x] Confirm before delete
- [ ] Add dots menu for [copy link / copy id / delete]
- [ ] Add support for field types determining column width (needs discussion)

## Create Item

- [x] Put them in the drawers
- [x] Render the form with default values from controllers
- [x] Call the mutation to create items then navigate
- [x] Handle client-side validation (see posts form extensions and checkbox controller)
- [x] Handle errors (show the error message up the top for now)
- [x] Notification when you've created an item
- [ ] Always hide virtual fields in the create form
- [ ] (Nested) Handle the fact that relationships will be auto-linked with a message, preset value, etc.
  - [ ] From editing, set the value of the field and make it "read" mode
  - [ ] From creating, show a message instead
  - [ ] Need a config option to turn inline create off (`hideCreate`, defaults to `true`)
  - [ ] Ensure inline creation respects the list `hideCreate` config option
- [ ] Handle the case where there are no editable fields in the create screen (needs discussion)
- [ ] Implement autoCreate feature (where you can create a new item without user input)

## Edit Item

- [x] Add reset changes
- [x] Disable save & reset changes when there are no changes
- [x] Only send changed fields to API
- [x] Render the item title as the header
  - [ ] Make sure the item title is refreshed when the item is saved
- [ ] Add a "create" button to the header
- [ ] Fix page styles & navigation
- [ ] Implement sticky toolbar
- [x] Implement Delete Item
- [x] Copy ItemID to Clipboard
- [x] Show access control errors for fields
- [x] ~~Handle the case where there are no editable fields (disable button, w/ tooltip)~~ (users won't be able to edit anything and then the button will have a tooltip saying something like "nothing has changed so you can't save")
- [x] Handle the case where there are no visible fields (show a message)
- [x] Confirm before delete
- [x] Notification when you've updated an item
- [x] When a permission failure happens updating an item, don't show `read` permission errors in the item form

## Fields

- [x] Relationship views
  - [x] Make sure nested create works
- [x] Password views
- [x] Virtual field
- [ ] Timestamp field
- [x] Integer field
- [x] Select
- [ ] All the filter UI
- [x] Client-side validation API for fields
- [ ] DependsOn field dependencies
- [x] Show proper field label (currently path)
- [ ] Show required status for fields
- [ ] Show descriptions under fields
- [ ] Standardise the components for rendering common field UI (label, description, etc)

## Backlog

- [ ] Select all items matching a filter (requires resolver support to implement)
- [ ] Update selected item(s) (this needs some thought around certain fields like relationships)
- [ ] Deal with what it means to not be able to read any items (static access control)
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
