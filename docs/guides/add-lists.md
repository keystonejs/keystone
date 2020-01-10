<!--[meta]
section: guides
title: Adding Lists To Your Keystone Project
subSection: setup
order: 2
[meta]-->

# Adding Lists To Your Keystone Project

We've already created one list during [previous tutorial](/docs/guides/new-project.md).
Now it's the time to dive deeper. Let's make ToDos object a bit more complex.

## Creating basic list in separate file

To improve maintainability of your code it is convenient to split List schemas to separate files. Then we can import it in `index.js` for registration. Create a directory
named 'lists', with a file `Todos.js` inside of it and put the following code inside.

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

Here we described a very basic schema of generic ToDo. Let's register it.
Inside of `index.js` import the defined schema and replace the existing one with the required version.

```javascript
const TodosSchema = require('./lists/Todos.js');

keystone.createList('Todo', TodosSchema);
```

Make sure to relaunch keystone's instance and check, that everything still works fine.

## Adding fields

Tasks usually have a few more fields. Let's add an ability to set deadlines and assignee of a task:

```javascript
// import another field type - CalendarDay
const { Text, CalendarDay } = require('@keystonejs/fields');

// define new field
module.exports = {
    // ...
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

## Defining User list

Take a look at the `assignee` field. Now we're just typing in a name. Why don't we make separate User list, so we can point assigned tasks to a specific User.
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

Relaunch your app and check if new list appeared in admin panel. Note, now `type: Password` looks when you're creating new user.
But how can we assign a task to specific user? Let's proceed with [Defining Relationships](/docs/guides/relationships.md)

See also:
[Schema - Lists & Fields](/docs/guides/schema.md)
[API - createList](/docs/api/create-list.md)
