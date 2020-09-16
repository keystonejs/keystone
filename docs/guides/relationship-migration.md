<!--[meta]
section: guides
title: Relationship migration
[meta]-->

# Relationship migration guide

In the [`Arcade`](/docs/discussions/new-data-schema.md) release of Keystone we [changed the database schema](/docs/discussions/new-data-schema.md) which Keystone uses to store its data.
This means that if you are upgrading to these new packages you will need to perform a migration on your database in order for it to continue working.

This document will help you understand the changes to the database schema, which will help you understand the migrations you need to perform.

We recommend familiarising yourself with the [relationships](/docs/discussions/relationships.md) documentation to make sure you understand the terminology used in this document.

> **Note:** If you're starting a new project today which includes the [`Arcade`](/docs/discussions/new-data-schema.md) release of Keystone (check your `package.json`), there is no action required; you already have the latest and greatest database schema.
> If you have an existing project which you have upgraded to the [`Arcade`](/docs/discussions/new-data-schema.md) release of Keystone; read on.

## Overview

There are four steps to updating your database:

1. Take a backup of your production database.
2. Identify the changes required for your system.
3. Apply the changes to your database.
4. Deploy and test your application.

The specifics of how to do each of these steps will depend on the particulars of your deployment.

## Database backup

It is vitally important that you take a backup of your database before performing any changes.
It is also crucial that you are able to restore your database if need be.

If you are managing your own database, please consult the documentation for your database.
If you are using a managed database, you should consult the documentation for your service, as they likely already provide systems for backing up and restoring your database.

> **Important:** Making changes to your database schema includes a risk of **complete data loss** if you make a mistake. Do not attempt updating your database unless you are certain you can safely recover from a data loss event.

### MongoDB

The [official MongoDB documentation](https://docs.mongodb.com/manual/tutorial/backup-and-restore-tools/) provides details on how to use `mongodump` and `mongorestore` to backup and restore your database.

### PostgreSQL

The [official PostgreSQL documentation](https://www.postgresql.org/docs/12/backup.html) provides a number of different techniques for backing up and restoring your database.

## Identify required changes

The next step is to identify the changes you need to make to your database.
To assist with this you can use the command `keystone upgrade-relationships`.
This tool will analyse your relationships and generate a summary of the changes you need to make in your database.
We recommend adding it as a script into your `package.json` file and running it with `yarn`.

```bash
keystone upgrade-relationships
```

By default this command will look for an export called `keystone` in your `index.js` file.
If you have a custom server setup, you can indicate a different entry file with

```bash
keystone upgrade-relationships --entry <filename>
```

Your entry file must export a `Keystone` object called `keystone`, and this needs to have all of your lists configured using `createList`.
This command will not connect to your database and will not start any express servers.

The output you see will give you a summary of all the relationships in your system, and details of what actions you need to take to update your database.

#### MongoDB

```shell title="Example Output" showLanguage=false allowCopy=false
ℹ Command: keystone upgrade-relationships
One-sided: one to many
  Todo.author -> User
    * No action required
One-sided: many to many
  Todo.reviewers -> User
    * Create a collection todo_reviewers_manies with fields Todo_left_id and User_right_id
    * Move the data from todos.reviewers into todo_reviewers_manies
    * Delete todos.reviewers
Two-sided: one to one
  Todo.leadAuthor -> User.leadPost
    * Delete users.leadPost
Two-sided: one to many
  Todo.publisher -> User.published
    * Delete users.published
Two-sided: many to many
  Todo.readers -> User.readPosts
    * Create a collection todo_readers_user_readposts with fields Todo_left_id and User_right_id
    * Move the data from todos.readers into todo_readers_user_readposts
    * Delete todos.readers
    * Delete users.readPosts
```

#### PostgreSQL

```shell title="Example Output" showLanguage=false allowCopy=false
ℹ Command: keystone upgrade-relationships
One-sided: one to many
  Todo.author -> User
    * No action required
One-sided: many to many
  Todo.reviewers -> User
    * Rename table Todo_reviewers to Todo_reviewers_many
    * Rename column Todo_id to Todo_left_id
    * Rename column User_id to User_right_id
Two-sided: one to one
  Todo.leadAuthor -> User.leadPost
    * Delete column User.leadPost
Two-sided: one to many
  Todo.publisher -> User.published
    * Drop table User_published
Two-sided: many to many
  Todo.readers -> User.readPosts
    * Drop table User_readPosts
    * Rename table Todo_readers to Todo_readers_User_readPosts
    * Rename column Todo_id to Todo_left_id
    * Rename column User_id to User_right_id
```

### Generate migrations

The `upgrade-relationships` script can also be used to generate migration code which you can directly run against your database using the `--migration` flag.

```bash
keystone upgrade-relationships --migration
```

> **Note:** Always be careful when running auto-generated migration code.
> Be sure to manually verify that the changes are doing what you want, as incorrect migrations can lead to data loss.

# 

> **Important:** While we have taken every effort to ensure the auto-generated migration code is correct, we cannot account for every possible scenario.
> Again; please verify the changes work as expected to avoid data loss.

#### MongoDB

```javascript title="Example migration" allowCopy=false showLanguage=false
db.todos.find({}).forEach(function (doc) {
  (doc.reviewers || []).forEach(function (itemId) {
    db.todo_reviewers_manies.insert({ Todo_left_id: doc._id, User_right_id: itemId });
  });
});
db.todos.updateMany({}, { $unset: { reviewers: 1 } });
db.users.updateMany({}, { $unset: { leadPost: 1 } });
db.users.updateMany({}, { $unset: { published: 1 } });
db.todos.find({}).forEach(function (doc) {
  (doc.readers || []).forEach(function (itemId) {
    db.todo_readers_user_readposts.insert({ Todo_left_id: doc._id, User_right_id: itemId });
  });
});
db.todos.updateMany({}, { $unset: { readers: 1 } });
db.users.updateMany({}, { $unset: { readPosts: 1 } });
```

#### PostgreSQL

```SQL title="Example migration" allowCopy=false
ALTER TABLE public."Todo_reviewers" RENAME TO "Todo_reviewers_many";
ALTER TABLE public."Todo_reviewers_many" RENAME COLUMN "Todo_id" TO "Todo_left_id";
ALTER TABLE public."Todo_reviewers_many" RENAME COLUMN "User_id" TO "User_right_id";
ALTER TABLE public."User" DROP COLUMN "leadPost";
DROP TABLE public."User_published"
DROP TABLE public."User_readPosts"
ALTER TABLE public."Todo_readers" RENAME TO "Todo_readers_User_readPosts";
ALTER TABLE public."Todo_readers_User_readPosts" RENAME COLUMN "Todo_id" TO "Todo_left_id";
ALTER TABLE public."Todo_readers_User_readPosts" RENAME COLUMN "User_id" TO "User_right_id";
```

### Cheatsheet

If you want a handy reference to consult without needing to execute scripts then please consult the [new schema cheatsheet](/docs/guides/new-schema-cheatsheet.md).

## Apply changes

The next step is to apply the required changes to your database.
Keystone provides a lot of flexibility in how and where you deploy your database.
This means that there is no one-size-fits-all solution for the best approach to making changes to your database.

If you already have an established schema migration process then you can simply continue to follow that process, using the output of the `upgrade-relationships` script as the content for a new migration.

If you do not have an existing schema migration process then the best place to start is the [migrations guide](/docs/guides/migrations.md).
This document outlines a number of different approaches to performing database migrations.

## Test and deploy

The final step is to test and deploy your upgraded Keystone system.
If you have successfully migrated your database then you should be able to start Keystone and have it connect to your updated database.
Keystone does not dictate how or where you run your deployments, so you should follow your existing processes for this step.

It is advisable to do a test deployment in a controlled, non-production environment.
This will allow you to verify that your application is working correctly with the upgraded database.

## Summary

Congratulations, you have upgraded your Keystone system to the new and improved data schema!
If you experience any issues with the above process, please [create an issue](https://github.com/keystonejs/keystone/issues) on Github and we will endeavour to help you out.
