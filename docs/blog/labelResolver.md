<!--[meta]
section: blog
title: Using keystone's labelResolver
date: 2020-10-12
author: Noviny
order: 0.3
[meta]-->

In keystone's admin UI, we want to make it easy to display items and get a feel for your content at a glance. One of the important things here is being able to have meaningful labels for each item in your database when you're viewing a bunch of those items as a list. To do this, we have the `labelResolver`.

In this blog, we'll walk you through the default behaviours for labels, how to customise the label, and even how to use information from a relationship in the label.

## What is the Label?

The label is the way an item is represented by keystone's admin UI. It is both how items are primarily identified in the list view, as well as how they are displayed as a relationship to another item. The label is the human-readable reference for what an item 'is' in keystone, and can often be used instead of an item's database `id` as a way to identify it.

## Using the Name Field

By default, the label uses the `name` field of an item. From a very simple user list such as:

```js
const User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'do MMMM yyyy',
      dateFrom: '1901-01-01',
      dateTo: formatISO(new Date(), { representation: 'date' }),
    },
    password: { type: Password },
  },
};
```

Which gives us:

// screenshot 1 - screenshot of `User` with both `label` and `name` visible.

## Using Another Field

In some circumstances, this may not be the correct field to use. Say we have a new list `Post`, which we have set up like this:

```js
const Post = {
  fields: {
    title: { type: Text },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    author: {
      type: AuthedRelationship,
      ref: 'User',
      isRequired: true,
    },
    body: { type: Wysiwyg },
    // and probably some other fields we won't use here
  },
};
```

In our posts, we don't have a `name` field, instead preferring to call the primary identifying field `title`. As there's no `name` field, label will use the ID, which will give us something like:

// screenshot 2

Not very human friendly.

We could rename title to name, but that's not what we want. What we _do_ want is to make the label use the title for display. For this, we can add a `labelResolver` to our post field

```js
const Post = {
  fields: {
    title: { type: Text },
    // and the rest of the fields too
  },
  labelResolver: item => item.title,
};
```

Now we get the much more useful:

// screenshot 3

## Providing extra information in the label

While sometimes you may just want to use another field, at other times though there may be other bits of information that are always pertinent. Say for our post above, we have a status field, and we want to display in the label whether something is in `draft` mode or not.

Here we can modify our `labelResolver` to add in this extra detail.

```js
const Post = {
  fields: {
    title: { type: Text },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    // and the rest of the fields too
  },
  labelResolver: item => `${item.status === 'draft' ? 'DRAFT - ' : ''}` + item.title,
};
```

which means our posts now appear as:

// screenshot 4

> Note: The `label` for items in a public list is always public! Even if other bits of the item may be private. We recommend when picking what to put in a label, make sure nothing private (like email) is included.

## Using Another List

Great, we've got a fairly robust `Post` label, but we want to extend it just a little bit more - like adding the author's name in as well. This information isn't actually found on the item, so we're going to need to fetch it.

Not to worry though, `labelResolver` can easily be made async, and we can fetch other information from related items. We can modify our `labelResolver` to:

```js
const Post = {
  fields: {
    author: {
      type: AuthedRelationship,
      ref: 'User',
      isRequired: true,
    },
    // and the rest of the fields too
  },
  labelResolver: async item => {
    const { data } = await keystone.executeGraphQL({
      query: `query {
          User(where: {id: "${item.author}" }) {
            name
          }
        }`,
    });

    return `${item.status === 'draft' ? 'DRAFT ' : ''}` + item.title + ` (${data.User.name})`;
  },
};
```

and we will get our display of:

// screenshot 5

Now we have the status of a post, its title, and the name of the author, all bundled into the label.

Bundling in the author here might be overkill, but if you want to bundle information from a relationship, it's easy to do.

## Using Other Information

Finally, let's have a fun example. Our users have birthdays, and we want to surface this in a warm, friendly way. As such, we've decided to add an emoji right into the label whenever it's a user's birthday - everywhere a label refers to them will show a little party celebration.

For this we can write a `labelResolver` such as:

```js
const User = {
  fields: {
    // all our previous user fields
    dob: {
      type: CalendarDay,
      format: 'do MMMM yyyy',
      dateFrom: '1901-01-01',
      dateTo: formatISO(new Date(), { representation: 'date' }),
    },
  },
  labelResolver: item => {
    let currentDay = new Date().toISOString().slice(0, 10);
    if (item.dob === currentDay) {
      return `🍰 ${item.name}`;
    } else {
      return item.name;
    }
  },
};
```

And now we can see that it's Luke's birthday! Happy birthday Luke!

// screenshot 6

> Note: this makes the label dynamic, which means it can't be relied upon by other bits of the system as an item's unique identifier. You should be aware of this when making a dynamic label, but if it suits your needs, let the good times roll.

## Enough Labeling for one day

Hopefully this gives you a good idea of what labels are for in keystone (and the ways you can adapt them to your needs when the defaults aren't what you want), as well as good guidance on responsible labeling within the flexibility that keystone offers.
