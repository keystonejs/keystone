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
into separate files. Create a directory named `lists`, with a file `Todos.js`
and put the following code inside.

```javascript
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

```javascript
const TodosSchema = require('./lists/Todos.js');

keystone.createList('Todo', TodosSchema);
```

Make sure to relaunch Keystone and check that everything is working as expected.

## Adding fields

`Todo` tasks usually have a few more fields. Let's add the ability to set
deadlines and the assignee of a task:

```javascript
const { Text, CalendarDay } = require('@keystonejs/fields');

module.exports = {
  {
    deadline: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: '2019',
      yearRangeTo: '2029',
      isRequired: false,
      defaultValue: new Date().toISOString('YYYY-MM-DD').substring(0, 10),
    },
    assignee: {
      type: Text,
      isRequired: true,
    },
  },
}
```

If you're curious about the usage options you can read [more about `CalendarDay`](/packages/fields/src/types/CalendarDay/README.md).
Now it's time to explore docs on other field types and get a bit familiar with them. It will help you make your schema cleaner.

## Defining a `User` list

Take a look at the `assignee` field. Now we're just typing in a name.
Why don't we make a separate `User` list, so we can point assigned tasks to a specific `User`.
Create another file `Users.js` in the `lists` directory. It should look like this:

```javascript
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

```javascript
const UsersSchema = require('./lists/Users.js');

keystone.createList('User', UsersSchema);
```

<!-- FIXME:TL We haven't shown then how to get an Admin UI yes!!!! -->

Relaunch your app and check if new the list appeared in the Admin UI.
But how can we assign a task to specific user? Let's proceed with [Defining Relationships](/docs/tutorials/relationships.md)

See also:

- [Schema - Lists & Fields](/docs/guides/schema.md)
- [API - createList](/docs/api/create-list.md)
