<!--[meta]
section: tutorials
title: Creating relationships
order: 4
[meta]-->

# Creating relationships

This chapter assumes that that the reader has the code that was created in the
previous tutorials:

1. [Creating a new project](/docs/tutorials/new-project.md)
2. [Adding lists](/docs/tutorials/add-lists.md)

## To-single relationship

Let's link the Todo list and the User list together by setting up
a `relationship`. Tweak the `assignee` field in `Todo.js` to match the following code:

Import the `Relationship` field:

```javascript title=/lists/Todo.js
const { CalendarDay, Checkbox, Relationship, Text } = require('@keystonejs/fields');
```

Update the field type from `Text` to `Relationship` and provide a `ref` that
points to which list the field is related to.

```diff title=/lists/Todo.js allowCopy=false showLanguage=false
assignee: {
-  type: Text,
+  type: Relationship,
+  ref: 'User',
  isRequired: true,
}
```

The `ref` option defines the `List` to which we will relate. The name assigned
to the option is the same name that is passed to `createList`. In the Admin UI
you can now pick one of the created users to make them responsible for
completing the task.

## Two-way to-single relationship

It is now possible to assign a task to a user, but it is not possible to assign
the user to a task! In `User.js` add the following field:

```javascript title=/lists/User.js
task: {
  type: Relationship,
  ref: 'Todo',
}
```

Now we can set a task for the User from the admin panel. But something is wrong!
When we pick a task for the user and then check this task, the `assignee` is incorrect.
This is because we have create two separate one-sided relationships.
What we want is a single two-sided relationship.

## Setting up a two-sided relationship between User and Todo

In order to indicate that `task` and `assignee` are just two different sides of a single relationship, we need to update our configurations
In `User.js` adjust the `task` field to the following:

```diff title=/lists/User.js allowCopy=false showLanguage=false
task: {
  type: Relationship,
-  ref: 'Todo',
+  ref: 'Todo.assignee',
}
```

And in `Todo.js` update the `assignee` field:

```diff title=/lists/Todo.js allowCopy=false showLanguage=false
assignee: {
  type: Relationship,
-  ref: 'User',
+  ref: 'User.task',
}
```

Start the Admin UI, create a Todo and assign a user. Check the user's `task`
field and notice that it is already set!

## To-many relationship

What if a user needs to be able to do multiple tasks? Keystone provides a way to
do this easily. Take a look at following code in `User.js`:

```javascript title=/lists/User.js
tasks: {
  type: Relationship,
  ref: 'Todo.assignee',
  many: true,
}
```

The `many: true` option indicates that `User` can store multiple references to
tasks.

> **Note:** we've updated the name of the field from `task` to `tasks` to
> indicate the nature of the relationship.

Copy this code to your application and don't forget to change the `assignee`
field in `Todo.js` to match the new field name `User.tasks`. Now in the Admin
UI you can pick multiple tasks for a user.

See also:

- [Relationships](/docs/discussions/relationships.md)
- [Schema - Lists & Fields](/docs/guides/schema.md)
- [Field Types - Relationship](/packages/fields/src/types/Relationship/README.md)
