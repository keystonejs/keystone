<!--[meta]
section: tutorials
title: Adding lists
order: 2
[meta]-->

# Adding lists

We've already created one list during the [previous
tutorial](/docs/tutorials/new-project.md). Now it's the time to dive deeper.
Let's make our `Todo` list a bit more complex.

## Creating lists by file

To improve maintainability of your code it can be convenient to split `List` schemas
into separate files. Create a directory named `lists`, with a file `Todo.js`
and put the following code inside.

```javascript title=/lists/Todo.js
const { Text, Checkbox } = require('@keystonejs/fields');

module.exports = {
  fields: {
    description: {
      type: Text,
      isRequired: true,
    },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
  },
};
```

<!-- We should describe the function of, or link to documentation for `isRequired` and `defaultValue` -->

Here we described a very basic schema for a generic `Todo`. Let's add it to our
Keystone application. Inside of `index.js` import the defined schema and replace
the existing one with the required version.

```javascript title=index.js
const TodoSchema = require('./lists/Todo.js');

keystone.createList('Todo', TodoSchema);
```

Make sure to relaunch Keystone and check that everything is working as expected.

## Adding fields

`Todo` tasks usually have a few more fields. Let's add the ability to set
deadlines and the assignee of a task:

```javascript title=/lists/Todo.js
const { Text, CalendarDay, Checkbox } = require('@keystonejs/fields');

module.exports = {
  fields: {
    // existing fields
    description: {
      type: Text,
      isRequired: true,
    },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
    // added fields
    deadline: {
      type: CalendarDay,
      format: 'do MMMM yyyy',
      yearRangeFrom: '2019',
      yearRangeTo: '2029',
      isRequired: false,
      defaultValue: new Date().toISOString('YYYY-MM-DD').substring(0, 10), // Today's date
    },
    assignee: {
      type: Text,
      isRequired: true,
    },
  },
};
```

If you're curious about the usage options you can read [more about `CalendarDay`](/packages/fields/src/types/CalendarDay/README.md).
Now it's time to explore docs on other field types and get a bit familiar with them. It will help you make your schema cleaner.

## Defining a `User` list

Take a look at the `assignee` field. Now we're just typing in a name.
Why don't we make a separate `User` list, so we can point assigned tasks to a specific `User`.
Create another file `User.js` in the `lists` directory. It should look like this:

```javascript title=/lists/User.js
const { Text, Password } = require('@keystonejs/fields');

module.exports = {
  fields: {
    username: {
      type: Text,
      isRequired: true,
    },
    password: {
      type: Password,
      isRequired: true,
    },
  },
};
```

And register it in `index.js`:

```javascript title=index.js
const TodoSchema = require('./lists/Todo.js');
const UserSchema = require('./lists/User.js');

keystone.createList('Todo', TodoSchema);
keystone.createList('User', UserSchema);
```

<!-- FIXME:TL We haven't shown then how to get an Admin UI yet!!!! -->

Relaunch your app and see the lists appear in the Admin UI.

But how can we assign a task to specific user? Let's proceed with [Defining Relationships](/docs/tutorials/relationships.md)

See also:

- [Schema - Lists & Fields](/docs/guides/schema.md)
- [API - createList](/docs/api/create-list.md)
