<!--[meta]
section: tutorials
title: Custom fields
order: 5
[meta]-->

# Custom Field: `Stars`

In this tutorial we will be creating a simple custom Field Type for star ratings ⭐️ ⭐️ ⭐️ ⭐️ ⭐️!

For this component, our data requirements are simple, we need to store an Integer that represents the number of stars. We can extend the built-in Integer type to leverage its implementation and provide only custom behaviour and UI components where necessary.

## Defining The Field Type

This is what our custom field's directory will look like once we're finished:

```sh
.
└── Stars
    ├── index.js
    ├── Implementation.js
    └── views
        ├── Cell.js
        ├── Field.js
        ├── Filter.js
        ├── Stars.js
        ├── star-empty.svg
        └── star-full.svg
```

Custom fields should have an `index.js` file which exports a field definition. The field definition pulls together all the parts that make up a field including front-end and back-end code.

For our Stars field it looks something like this:

```js
const { Stars, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementation');

const { Integer } = require('@keystonejs/fields');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
  views: {
    Controller: Integer.views.Controller,
    Field: require.resolve('./views/Field'),
    Filter: Integer.views.Filter,
    Cell: require.resolve('./views/Cell'),
  },
};
```

The `implementation` and `adapters` reference back-end code used by Keystone, and everything under `views`, references front-end code used in either the Admin UI or GraphQL apps.

You may have realised now that front-end and back-end code cannot be bundled together in the same file. That's why we use `require.resolve` to provide a string value rather than importing front-end code. The string value is a reference to the location of the files. Keystone has a special build step that compiles front-end code for field types.

Note: If you want to package field types for use outside your own project, there are additional step involved, however these are outside the scope of this tutorial.

## Implementation

Let's start by looking at `Implementation.js`.

```js
const { Integer } = require('@keystonejs/fields');

class Stars extends Integer.implementation {
  extendAdminMeta(meta) {
    return { ...meta, starCount: this.config.starCount || 5 };
  }
}

module.exports = {
  Stars,
  MongoIntegerInterface: Integer.adapters.mongoose,
  KnexIntegerInterface: Integer.adapters.knex,
};
```

It's convention with existing field types to export the field implementation class, together with the adapter interfaces.

Adapters provide an interface between our field and the database. Here we define how a queries and mutations should be translated into SQL or MongoDB actions. Again, as our implementation for the Stars is going to be the same as the Integer field type, we can just re-export the adapters for the Integer field type.

We're not changing anything about how the data is stored, so for now we're just going to going to re-export the adapters for the `Integer` field.

The implementation class is used in the Keystone back-end. It defines a number of things. Firstly, the GraphQL interface including types, queries and resolvers; secondly, field properties such as if a field is orderable; and finally, what data Keystone should pass to the Admin UI.

For our Stars field, the only thing we want to change from the `Integer` implementation is to add configuration option for the number of stars. Because of this we can `extend` the `Integer` implementation class and override the method `extendAdminMeta`.

### Views

Now that we've got the back-end interface in place let's look at the UI components.

This normally starts with the controller. The controller defines how front-end features work, including: filtering, default values, serialization of data, label resolvers and some GraphQl options. In our example filtering, default values and controller aspect will all be the same as the `Integer` field. So once again, we're just going to reference the Integer controller.

**Note**: `Integer.views.Controller` will also resolve to a path within the `node_modules` folder and will also be bundled by Keystone at build time.

The rest of the views relate to React components rendered in the Admin UI. We can start by creating a generic `<Stars>` component that will render a number of stars, either solid or outlined, depending on the count and value props. So, a 3 stars out of 5 rating would look like this:

```jsx
  <Stars count={5} value={3}>
```

You can find an example of this component in the [custom-fields demo project](https://github.com/keystonejs/keystone/tree/master/examples/custom-fields/fields/Stars/views/Stars.js).

Once we have a component for star ratings we can use this in Keystone.

#### Cell

The cell component is rendered in a table that shows a list of items the in Keystone Admin UI. We're going to use the star component we made. Our cell component is going to make use of the data, which will be the integer value, and the `starCount` field config option we added in the Implementation.js file. You can interact with the cell so we don't provide any `onChange` prop to the component.

```jsx title=/views/Cell.js
/** @jsx jsx */

import { jsx } from '@emotion/core';
import Stars from './Stars';

export default function StarsCell({ field, data }) {
  const { starCount } = field.config;
  return <Stars count={starCount} value={data} />;
}
```

## Field

The field component provides the main interface used when creating or editing list items in Keystone. To get a consistent look, we're going to import some wrapping components from `@arch-ui/fields`, that's Keystone's UI library. This will render the labels and provided consistent spacing. Other than this we simply delegate the `onChange` event to the `Stars` so that values can be updated when a user clicks on the stars.

```jsx
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Stars from './Stars';

const StarsField = ({ field, value, errors, onChange }) => (
  <FieldContainer>
    <FieldLabel htmlFor={`ks-input-${field.path}`} field={field} errors={errors} />
    <FieldInput>
      <Stars count={field.config.starCount} value={value} onChange={onChange} />
    </FieldInput>
  </FieldContainer>
);
export default StarsField;
```

That's it, we now have a basic custom field.

## Next Steps

Take a look at this example and others in the [custom-fields demo project](https://github.com/keystonejs/keystone/tree/master/examples/custom-fields/) in the Keystone repository.
