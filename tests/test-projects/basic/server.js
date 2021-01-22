const express = require('express');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initialData = require('./data');

keystone
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await dropAllDatabases(keystone.adapters);
      await createItems({ keystone, listKey: 'User', items: initialData.User });
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      await dropAllDatabases(keystone.adapters);
      await seedData(initialData);
      res.redirect('/admin');
    });

    app.use(middlewares);

    app.listen(port, error => {
      if (error) throw error;
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

/**
 * @param {object} list of all the keystone adapters passed in while configuring the app.
 * @returns {Promise[]} array of Promises for dropping the keystone databases.
 */
function dropAllDatabases(adapters) {
  return Promise.all(Object.values(adapters).map(adapter => adapter.dropDatabase()));
}

/*
 * Seed the initial data using `createItem` API
 * 1. Insert all the lists having no associated relationships: User, PostCategory, and ReadOnlyList.
 * 2. Insert `Post` data, with the required relationships, via `connect` nested mutation.
 */
async function seedData(initialData) {
  const users = await createItems({
    keystone,
    listKey: 'User',
    items: initialData['User'],
    returnFields: 'id, email',
  });

  const postCategories = await createItems({
    keystone,
    listKey: 'PostCategory',
    items: initialData['PostCategory'],
    returnFields: 'id, name',
  });

  await createItems({
    keystone,
    listKey: 'ReadOnlyList',
    items: initialData['ReadOnlyList'],
    returnFields: 'id, name',
  });

  const Post = [
    {
      data: {
        name: 'Lets talk React Router',
        author: {
          connect: { id: users.find(user => user.email === 'ben@keystone.com').id },
        },
        categories: {
          connect: postCategories.filter(p => /^React/i.test(p.name)).map(i => ({ id: i.id })),
        },
      },
    },
    {
      data: {
        name: 'Hello Things',
      },
    },
    {
      data: {
        name: 'How we built Keystone 5',
        author: { connect: { id: users.find(user => user.email === 'ben@keystone.com').id } },
        categories: {
          connect: postCategories
            .filter(
              ({ name }) =>
                name === 'React' || name === 'Keystone' || name === 'GraphQL' || name === 'Node'
            )
            .map(i => ({ id: i.id })),
        },
      },
    },
  ].concat(Array(120).fill(true).map(createPost(users, postCategories)));

  // Run the GraphQL query to insert all the post
  await createItems({ keystone, listKey: 'Post', items: Post });
}

function createPost(users, postCategories) {
  return (_, i) => {
    const user = users[i % users.length];
    return {
      data: {
        name: `Why ${i} is better than ${i - 1}`,
        views: i,
        author: { connect: { id: user.id } },
        categories: {
          connect: { id: postCategories.find(p => (p.name = 'Number comparison')).id },
        },
      },
    };
  };
}
