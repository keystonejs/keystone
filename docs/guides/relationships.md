<!--[meta]
section: guides
title: Creating Relationships Between Lists
[meta]-->

# Creating Relationships Between Lists

## Add an assignee from Users collection to a Todo (to-single relationship)

Now that we have created all of the neccessary lists we can set up relationships between them with Keystone's `Relationship` type.

In `Todos.js`, import the `Relationship` type from Keystone and update change the type from `Text` to `Relationship`. This tells Keystone that this field is a relationship. 

```diff
+ const { Relationship } = require('@keystone-alpha/fields');
 // ...
    asignee: {
-        type: 'Text',
+        type: Relationship,
         isRequired: true,
     }
 //...
```
Now that Keystone knows that `asignee` field is a `Relationship`, we need a way to tell Keystone what `asignee` is actually related to. This is where the `ref` option comes in. `ref` takes a `string` that must match an existing Keystone List object defined with `createList`. We want an asignee to be one of our `User` List, so we add the `ref` prop accordingly:

```diff
  const { Relationship } = require('@keystone-alpha/fields');
 // ...
    asignee: {
         type: 'Text',
         type: Relationship,
         isRequired: true,
+        ref: 'User'
     }
 //...
```

Now in the admin panel you can pick one of the created users to make them responsible for task completion.

## Pick task from Todos collection (two-way to-single relationship)

We can assign a task to an user, but we can't yet assign an user to a task. This is because the `User` list has no `Relationship` type field to relate an `User` back to a task. What we want to do is set up a two-way one-one relationship between `User` and `Task`. This is like saying _"A user can be assigned to a single task, and a task can be owned by a single user."_

Let's add that relationship in `Users.js`:

```diff
 // ...
      password: {
       type: Password,
       isRequired: true,
     },
+     task: {
+         type: Relationship,
+         ref: 'Todo',
+     },
 // ...
```

Now we can set a Task for a User from the Admin UI. But it looks like something is wrong. When we pick a task for user and then checking this task - there are no assignee or someone else is assigned. We can solve this by...

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

See also:\
[Schema - Lists & Fields](../discussions/schema.md)\
[Field Types - Relationship](../../packages/fields/src/types/Relationship/README.md)
