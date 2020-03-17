<!--[meta]
section: tutorials
title: Creating Relationships Between Lists
order: 4
[meta]-->

# Creating Relationships Between Lists

This chapter assumes that that the reader has the code that was created in [Setup - Chapter 1](https://www.keystonejs.com/tutorials/new-project) and [Setup - Chapter 2](https://www.keystonejs.com/tutorials/add-lists).

## Pick assignee from Users collection (to-single relationship)

Let's link the Todo list and the User list together by setting up
a `relationship`. Tweak the `assignee` field in `Todos.js` to match the following code:

Import the `Relationship` field:

```javascript
const { Text, CalendarDay, Checkbox, Relationship } = require('@keystonejs/fields');
```

Old code:

```javascript
assignee: {
    type: Text,
    isRequired: true,
},
```

New code:

```javascript
assignee: {
    type: Relationship,
    ref: 'User',
    isRequired: true,
},
```

The `ref` option defines the `List` to which we will relate. The name assigned to the option is the same name that is passed to `createList`. In the Admin UI you can now pick one of the created users to make them responsible for completing the task.

## Pick task from Todos collection (two-way to-single relationship)

It is now possible to assign a task to a user, but it is not possible to assign the user to a task! Let's fix this.
In `Users.js` add the following:

```javascript
module.exports = {
  // ...
  task: {
    type: Relationship,
    ref: 'Todo',
  },
};
```

Now we can set a task for the User from the admin panel. But something is wrong! When we pick a task for the user and then check this task, the assignee is incorrect. This can be solved by using a `Back Reference`.

## Enabling Back Reference between Users and Todos

`Back References` are Keystone's mechanism that can overwrite fields of the referenced entity.
It is better seen in action, so let's write some code first.

In `Users.js` adjust the `task` field to the following:

```javascript
task: {
    type: Relationship,
    ref: 'Todo.assignee',
}
```

And in `Todos.js` update the `assignee` field:

```javascript
assignee: {
    type: Relationship,
    ref: 'User.task',
}
```

Start the Admin UI and create a Todo and assign a user. Check the user's `task` field and notice that it is already set! When a user is created and a Todo is assigned, the `assignee` field won't be filled in. Add the following code to make it work both ways:

```javascript
task: {
    type: Relationship,
    ref: 'Todo.assignee',
}
```

To test it out, remove the `isRequired: true` property from the `assignee` field in the `Todos` file:

```javascript
assignee: {
    type: Relationship,
    ref: 'User.task',
    // isRequired: true,
},
```

Create a Todo without assigning it to a user. Then go to a user, assign a Todo to the `task` field. Go back to the todo and notice that the `assignee` field has been filled in.

## Assigning multiple tasks to a user (to-many relationship)

What if a user needs to be able to do multiple tasks? Keystone provides a way to do this easily.
Take a look at following code in `Users.js`:

```javascript
tasks: {
    type: Relationship,
    ref: 'Todo.assignee',
    many: true,
}
```

The `many: true` option indicates that `User` can store multiple references to tasks. Note that we've changed `task` to `tasks`. Copy this code to your application and don't forget to change the `assignee` field in `Todos.js` to match the new field name `User.tasks`. Now in the Admin UI you can pick multiple tasks for a user.

See also:

- [Schema - Lists & Fields](/docs/guides/schema.md)
- [Field Types - Relationship](/packages/fields/src/types/Relationship/README.md)
