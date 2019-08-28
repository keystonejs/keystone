<!--[meta]
section: guides
title: Creating Relationships Between Lists
[meta]-->

# Creating Relationships Between Lists

## Pick assignee from Users collection (to-single relationship)

Now, when we've created all necessary lists, let's link each other by setting up
`relationship`. Tweak assignee field in `Todos.js` to match next code:

```javascript
{
    type: Relationship,
    ref: 'User',
}
```

Don't forget to import `Relationship` type. Option called `ref` defines, to which collection we will relate according to names we gave them in `index.js` file while calling `createList`. Now in admin panel you can pick one of created users to make him responsible for task completion.

## Pick task from Todos collection (two-way to-single relationship)

Now we can assign a task to user, but can't give user a task! Let's fix this.
In `Users.js` add following:

```javascript
module.exports = {
  // ...
  task: {
    type: Relationship,
    ref: 'Todo',
  },
};
```

Now we can set a task for User from admin panel. But it looks like something is wrong. When we pick a task for user and then checking this task - there are no assignee or someone else is assigned. We can solve this by...

## Enabling Back Reference between Users and Todos

Back Reference is a Keystone's mechanism that can overwrite field of referenced entity.
It is better seen in action so let's write some code first.

In `Users.js` adjust `task` field to following:

```javascript
task: {
    type: Relationship,
    ref: 'Todo.assignee',
}
```

And in `Todos.js` update `assignee` field:

```javascript
assignee: {
    type: Relationship,
    ref: 'User.task',
}
```

Take a look at admin panel and try to assign ToDo to user and notice, that when inspecting this user - `task` field is already set! Ensure that this works in other way.

## Assigning user to multiple tasks (to-many relationship)

What if we need user to do few tasks? Keystone provides a way to do this in an easy way.
Take a look at following code in `Users.js`:

```javascript
tasks: {
    type: Relationship,
    ref: 'Todo.assignee',
    many: true,
}
```

Option `many: true` indicates, that User can store multiple references to tasks. Note that we've changed `task` to `tasks`. Copy this code to your application and dont forget to change `assignee` field in `Todos.js` to match new field name. Now in admin UI you can pick multiple tasks for a user.

See also:

- [Schema - Lists & Fields](../guides/schema.md)
- [Field Types - Relationship](../../packages/fields/src/types/Relationship/README.md)
