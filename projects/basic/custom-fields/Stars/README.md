# Custom fields in Keystone 5

One Keystone feature request that has been around for a very long time is Custom Fields.
Finally this is available in Keystone 5 🎉.

In this post we will be creating a simple custom Field Type for star ratings ⭐️ ⭐️ ⭐️ ⭐️ ⭐️!

![Screenshot of the Stars input field in Keystone Admin UI]()

For this component, our data requirements are simple. We need to store an Integer in the database
to represent the number of stars on a blog post. This makes things easy because Integer is a built
in field type so we can leverage much of the Integer field type's default implementation and then
provide custom UI components for Keystone's admin interface.

## Directory structure

This is what our Custom field directory will look like once we're finished.

```sh
.
└── Stars
    ├── index.js
    ├── Controller.js
    ├── Implementation.js
    └── views
        ├── Cell.js
        ├── Field.js
        ├── Filter.js
        ├── StarWrapper.js
        ├── star-empty.svg
        └── star-full.svg
```

Lets walk through what's in here and what we are going to build.

The `index.js` file is what we import to add the field type to Keystone during setup. It pulls all
of the other files together in a format that can be consumed server side in node.js and bundled up
for the Admin UI in the browser.

`Controller.js` is a class used in the frontend by Keystone Admin. It defines how various features
of the field type work such as: GraphQL filter options, the formatting of various labels for
Keystone Admin UI, how data is formatted for sending via GraphQl and how it is interpreted when
retrieved from the server. In this example our requirements are the same as for Integer so we can
re-export the default [Integer field type's Controller](https://github.com/keystonejs/keystone-5/blob/master/packages/fields/types/Integer/Controller.js).

`Implementation.js` is used server side by Keystone. It exports an `Implementation` class and one or
more `Database Field Adapters`.

The `Implementation` class defines the GraphQL interface to our field type for data output, query,
create and update fields and their types. In the `Implementation` class we can also define options
that will be passed to the Admin UI. In our implementation we only need to add
some config to the AdminUI so we will `extend` the Integer `Implementation` class to add the config
we need. More on this later.

`Database Field Adapters` - Keystone-5 supports (at time of writting) both MongoDB and Postgres. The
Database Field Adapters define the interface between our data in javascript land on node.js and the
database. In here we can define how a query filter should be translated to a SQL or mongoDB query
and define the Schema for the field type. Again, as our implementation at this level is the same as
for the Integer field type, we can re-export the default Database Field Adapter(s).

The `views` folder holds everything we need to render our custom Star UI elements in Keystone AdminUI.
This is where we will spend most of our time in this tutorial.

---

## So lets get started

- create the directory structure
- use the default Integer view components and Classes to start.
- build out and explain what's happening in index.js
- import our new component to our project and see it working.
- update the Field component to show stars
- update our Cell component to show stars
- add `starCount` config option
- publish our custom component to npm and consume it in our app (optional).

## Wrapping up

This was a pretty basic custom field type. We only needed to create some custom UI components and
expose to Keystone in the way it is expecting.

In a future post we will dig deeper into some of the nitty gritty of creating custom field types
which have special database requirements or offer customised GraphQL utilities.
