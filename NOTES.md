> These should be moved into GitHub Issues at some stage, and removed from this
> document when they are.

# General

* [ ] create adapters
  * [ ] MongoDB
  * [ ] Postgres

* [ ] form renderer (takes an array of fields, used for create | update)
* [ ] custom nav
* [ ] custom routes / views
* [ ] plugins -> components (where?)
  * [ ] nav (left | right)
  * [ ] home
  * [ ] list view
  * [ ] item view
* [ ] Solidify loading / error experience across the Admin UI
* [ ] Consistent focus management
* [ ] Integrate filters, sorting and columns into the URL

# List

* [x] client-side class
  * [ ] queries and mutations
  * [ ] update apollo cache
* [ ] search implementation
* [ ] name field
* [ ] slug field
* [ ] sortable
* [ ] default sort
* [ ] default columns
* [ ] created | modified meta
* [ ] can create items
* [ ] can delete items
* [ ] read-only

* [ ] validate columns, filters
* [ ] card (for home)

# Fields

* [x] client-side class
* [ ] default value
  * [x] client-side
  * [ ] server-side
* [ ] show on create
* [ ] show on edit
* [ ] required / validation
  * [ ] client-side validation
  * [ ] server-side validation
* [ ] read-only
* [ ] inline-edit in list view
* [ ] notes
* [ ] size (for text fields)
* [ ] field-based updater
* [ ] unique value
* [ ] value generation
* [ ] no edit once set
* [ ] pre-save hooks
* [ ] watcher? (for deriving value from other fields)
* [ ] graphql formatting arguments
* [ ] base render component
* [ ] display logic (dependsOn, hidden)
* [ ] collapse

# API

* [ ] pagination
* [ ] advanced OR | AND filtering
* [ ] nested where
* [ ] other options?

# Field Types

* [ ] Timestamp
* [ ] Date
* [ ] Integer
* [ ] Relationship
* [ ] WYSIWYG
* [ ] File(s)
* [ ] Cloudinary Image(s)
