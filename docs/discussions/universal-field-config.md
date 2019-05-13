# Universal Field Config

* Initial values (default)
* Is required
* Is unique

See also [meeting notes](https://www.notion.so/thinkmill/Hairy-Session-May-10-cbc7920f1ef14ff5b8e79da8f4921765).

## Initial Value

> What value should be used for new items if no value is supplied?

Aka. default (but only relevant to creates)

```js
keystone.createList('Todo', { fields: { name: { type: Text, initialValue: 'they' } } });
```

* Can be one of three types:
	- Scalar
	- JS function
		+ Supplied (basically) the same args as hooks
	- A recognised Keystone-supplied symbol (eg. `new_uuid`, `current_datetime`)
* Default values for a new item is available via GraphQL in the list meta
	- Symbol as returned as enums?
	- Functions evaluated in current users context
	- Requires an additional output type for the list
* Admin UI: initial values are prefilled in the "create new" form
* Keystone: on create, if a field value is not supplied the default is used
* DB: added as "default" in Mongoose and DB schema
	- These shouldn't have any impact on Keystone
		+ Just handy if you're working directly against the DB

## Is Indexed

> Will this field be used to filter items when?

```js
keystone.createList('Todo', { fields: { name: { type: Text, isIndexed: true } } });
```

* Setting to true creates an index on the fields using whatever the adapter defaults are
* Multi-field can be added at the list level (this was the case in KS4 but should be support it?)
* Exotic indexes (sparse, partial, etc) can be configured in the field adapter options?
* Doesn't do any full-text-related indexing; doesn't help with "filtering" in the Admin UI
	- We should look at automatically adding additional indexes for the lists filterable fields

## Is Unique

> Should duplicate values be allowed in this field across items?

```js
keystone.createList('Todo', { fields: { name: { type: Text, isUnique: true } } });
```

* Specifics of case-sensitivity is up to the Adapter:
	- Both Postgres and mongoose as case-sensitive but default
		+ Worth noting this; eg. for username/email fields.
* Specifics of null handling is up to the Adapter:
	- Postgres: allows multiple nulls
	- Mongoose: errors on multiple nulls (unless using `sparse` index)
* Behind the scenes, creates an index (or makes the existing index `unique`)
	- Should we error on `{ isUnique: true, isIndexed: false }`?
