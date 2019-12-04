<!--[meta]
section: guides
title: Creating Relationships Between Lists
subSection: setup
order: 4
[meta]-->

# Creating Relationships Between Lists

## Pick assignee from Users collection (to-single relationship)

Now, when we've created all necessary lists, let's link them together by setting up
a `relationship`. Tweak the `assignee` field in `Todos.js` to match the following code:

```javascript
{
    type: Relationship,
    ref: 'User',
}
```

Don't forget to import the `Relationship` type. The `ref` option defines the collection to which we will relate. Give the name assigned to the desired list, as passed to `createList`. In the admin panel you can now pick one of created users to make them responsible for completing the task.

## Pick task from Todos collection (two-way to-single relationship)

Now we can assign a task to a user, but can't assign the user a task! Let's fix this.
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

Now we can set a task for the User from the admin panel. But something is wrong! When we pick a task for the user and then check this task, the assignee is incorrect. We can solve this by...

## Enabling Back Reference between Users and Todos

Back Reference is KeystoneJS' mechanism that can overwrite fields of the referenced entity.
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

Take a look at admin panel and try to assign a Todo to a user. Notice that the user's `task` field is already set! Ensure that this works the other way.

## Assigning a user to multiple tasks (to-many relationship)

What if we need user to do multiple tasks? KeystoneJS provides a way to do this easily.
Take a look at following code in `Users.js`:

```javascript
tasks: {
    type: Relationship,
    ref: 'Todo.assignee',
    many: true,
}
```

The `many: true` option indicates that `User` can store multiple references to tasks. Note that we've changed `task` to `tasks`. Copy this code to your application and don't forget to change the `assignee` field in `Todos.js` to match the new field name. Now in the admin UI you can pick multiple tasks for a user.

See also:

- [Schema - Lists & Fields](/docs/guides/schema.md)
- [Field Types - Relationship](/packages/fields/src/types/Relationship/)
