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

## Defining The Field Type

Field Types should have an `index.js` file which exports the Field Type definition. Explanations on what each thing does can be found [here](/packages/fields/README/index.md).

```jsx
const { Stars, MongoIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
  },
};
```

Right now, the Field Type defintion is referencing a bunch of files that don't exist yet so let's create create them!

For now, `Implementation.js` is only going to re-export from the `Integer` implementation

```jsx
const { Integer, MongoIntegerInterface } = require('@voussoir/fields/types/Integer/Implementation');

class Stars extends Integer {}

module.exports = {
  Stars,
  MongoIntegerInterface,
};
```

`Controller.js` is also going to re-export from the `Integer` Controller.

```jsx
export { default } from '@voussoir/fields/types/Integer/Controller';
```

### Views

We're going to define three views for our Field Type.

#### views/Cell.js

This is the component that will render into the List view. For now, we're going to make it render the number but we'll make it show stars later.

```jsx
export default function Cell(props) {
  return props.data;
}
```

#### views/Filter.js

We're going to reuse the Integer filter here so we'll re-export it.

```jsx
export { default } from '@voussoir/fields/types/Integer/views/Filter';
```

#### views/Field.js

For now, we're also going to re-export the Integer Field Type.

```jsx
export { default } from '@voussoir/fields/types/Integer/views/Field';
```

## Use the Field Type

We can now use the Stars Field Type in our project.

```jsx
const Stars = require('./Stars');

const keystone = new Keystone(...options);

keystone.createList('Post', {
  fields: {
    stars: { type: Stars },
  },
});
```

## Update Views

The Field Type works now but it's not super useful since it looks the same as an integer so let's update the views.

### Field component

We've already made a `Stars` component so we can use the component and write some code to handle changes like this.

```jsx
import React from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import Stars from './Stars';

export default class StarsField extends React.Component {
  handleChange = newValue => {
    const { field, onChange } = this.props;
    onChange(field, newValue);
  };

  render() {
    const { field, item } = this.props;
    const { starCount } = field.config;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Stars count={starCount} value={value} onClick={this.handleChange} />
        </FieldInput>
      </FieldContainer>
    );
  }
}
```

### Cell Component

The Cell component can also use our Stars component and the data prop.

```jsx
import React from 'react';
import Stars from './Stars';

export default function StarsCell({ data }) {
  return <Stars value={data} />;
}
```

## Adding a config option

Now we have a custom Field Type with its own views but we hard coded a maximum of five stars but it would be nice if people could configure the number of stars so let's add a `starCount` option for that.

First we need to expose it to the Admin UI, to do this, we can define a `extendAdminMeta` method on the `Stars` `Implementation`. You can pass anything here that can be stringified to JSON(i.e. no functions).

```jsx
const { Integer, MongoIntegerInterface } = require('@voussoir/fields/types/Integer/Implementation');

class Stars extends Integer {
  extendAdminMeta(meta) {
    return { ...meta, starCount: this.config.starCount || 5 };
  }
}

module.exports = {
  Stars,
  MongoIntegerInterface,
};
```

### Using it in the views

The config option is exposed as `props.field.config` so we use the `starCount` property to get it. Our `Stars` component already accepts a count prop so we can pass the star count and it'll use the option.

```jsx
import React from 'react';

import Stars from './Stars';

export default function StarsCell({ field, data }) {
  const { starCount } = field.config;
  return <Stars count={starCount} value={data} />;
}
```

## Wrapping up

This was a pretty basic custom field type. We only needed to create some custom UI components and
expose it to Keystone in the way it is expecting.

In a future post we will dig deeper into some of the nitty gritty of creating custom field types
which have special database requirements or offer customised GraphQL utilities.
