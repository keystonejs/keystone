# High-level TODOs

These should be moved into GitHub Issues at some stage, and removed from this document when they are.

If you have access, the
[Keystone 5 Launch Airtable](https://airtable.com/tbl2Fhi3m8DAUqyCl/viwmIvoN3X6aniMrg)
contains much of the same information and is more up-to-date.

## General

- [ ] Create adapters
  - [ ] MongoDB
  - [ ] Postgres
- [ ] Form renderer (takes an array of fields, used for create | update)
- [ ] Custom nav
- [ ] Custom routes / views
- [ ] Plugins -> components (where?)
  - [ ] Nav (left | right)
  - [ ] Home
  - [ ] List view
  - [ ] Item view
- [ ] Solidify loading / error experience across the Admin UI
- [ ] Consistent focus management
- [ ] Integrate filters, sorting and columns into the URL

## List

- [x] Client-side class
  - [ ] Queries and mutations
  - [ ] Update apollo cache
- [ ] Search implementation
- [ ] Name field
- [ ] Slug field
- [ ] Sortable
- [ ] Default sort
- [ ] Default columns
- [ ] Created | modified meta
- [ ] Can create items
- [ ] Can delete items
- [ ] Read-only

- [ ] Validate columns, filters
- [ ] Card (for home)

## Fields

- [x] Client-side class
- [ ] Default value
  - [x] Client-side
  - [ ] Server-side
- [ ] Show on create
- [ ] Show on edit
- [ ] Required / validation
  - [ ] Client-side validation
  - [ ] Server-side validation
- [ ] Read-only
- [ ] Inline-edit in list view
- [ ] Notes
- [ ] Size (for text fields)
- [ ] Field-based updater
- [ ] Unique value
- [ ] Value generation
- [ ] No edit once set
- [ ] Pre-save hooks
- [ ] Watcher? (for deriving value from other fields)
- [ ] Graphql formatting arguments
- [ ] Base render component
- [ ] Display logic (dependsOn, hidden)
- [ ] Collapse

## API

- [ ] Pagination
- [ ] Advanced OR | AND filtering
- [ ] Nested where
- [ ] Other options?

## Field Types

- [ ] Timestamp
- [ ] Date
- [ ] Integer
- [ ] Relationship
- [ ] WYSIWYG
- [ ] File(s)
- [ ] Cloudinary Image(s)
