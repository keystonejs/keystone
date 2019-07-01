<!--[meta]
section: guides
title: Adding Lists To Your Keystone Project
[meta]-->

# Adding Lists To Your Keystone Project

We've already created one list during [previous tutorial](./new-project.md).
Now it's the time to dive deeper. Let's make ToDos object a bit more complex.

## Creating basic list in separate file

To improve maintainability of your code it is convenient to split List schemas to separate file. Then we can import it in `index.js` for registration. Create a folder
named 'lists'. a file `Todos.js` inside of it and put following code inside.

```javascript
const { Text, Checkbox } = require('@keystone-alpha/fields');

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
Inside of `index.js` import defined schema and replace existing one with required version.

```javascript
const TodosSchema = require('./fields/Todos.js');

keystone.createList('Todos, TodosSchema');
```

Make sure to relaunch keystone's instance and check, that everything still works fine.

## Adding fields

Tasks usually have few more fields, let's add an ability to set deadlines and assignee of a task:

```javascript
// import another field type - CalendarDay
const { Text, CalendarDay } = require('@keystone-alpha/fields');

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
            defaultValue: Date.now(),
        },
        assignee: {
            type: 'Text',
            isRequired: true,
        },
    },
}
```

If you're curious about used options you can read more about `CalendarDay` [there](../../packages/fields/src/types/CalendarDay/README.md). Now it's a time to explore docs about other field types and get a bit familiar with them, it will help you make your schema cleaner.

## Defining User list

Take a look at `assignee` field. Now we're just typing in name. Why don't we make separate User list, so we can point assign tasks to someone.
Create another file `Users.js` in `fields` folder. It should look like this:

```javascript
const { Text, Password } = require('@keystone-alpha/fields');

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
const UsersSchema = require('./fields/Users.js');

keystone.createList('User', UsersSchema);
```

Realunch your app and check if new list appeared in admin panel. Note, now `type: Password` looks when you're creating new user. But how can we assign a task to specific user? Let's proceed with [Defining Relationships](./relationships.md)

See also:\
[Schema - Lists & Fields](../discussions/schema.md)\
[API - createList](../api/create-list.md)
