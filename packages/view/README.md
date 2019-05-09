---
section: packages
title: View
---

# View

This package contains functions to assist with view management in your Keystone system. This feature is ported from Keystone v4

## Initialize
Initialize View support by setting ExpressJs view engine options, you have to add respective view engine package in packages.json

```js
//... keystone.prepare().then( server, keystoneApp=> { 
  await keystoneApp.connect();
  server.app.use(bodyParser.urlencoded({ extended: true })); // required for forms processing
  server.app.set('views', './templates');
  server.app.set('view engine', 'pug');
//})
```
you need to create `templates` folder in root of the project where you keep all the view templates 

## Query

Create Routes to use `View`, `View` constructor needs instance of `Keystone` and `express app`.
For details check out the `demo-projects/blog-view` project. 

```js
module.exports = (keystone, app) => {
  app.use('/', async (req, res) => {
    const locals = res.locals || {};
    const view = new View(keystone, req, res);
    view.query(
      'posts',
      `{ 
          allPosts {
            title
            id
            body
            posted
            image {
              publicUrl
              filename
            }
            author {
              name
            }
          }
      }`
    );

    view.render('views/home', locals);
  });
};
```

Initialize this route after `keystone.prepare`

```js
const homeRoute = require('../routes/view/home');
homeRoute(keystoneApp, server.app)
```
> if there are multiple objects returned in GraphQl queries then both of them are attached to the `path` parameter in `view.query`

## Mutation
you can run mutation queries with `view.query`

## HTTP methods support in View
Similar to v4, View support `view.on` conditionals based on HTTP methods, for example you can process for post when specific field is having specific value, usually the case when you have multiple forms on page and yo want to handle them selectively. 
> Improved in v5, any query you add inside `view.on` will get executed before any other queries, giving you single page refresh to accomplish result refresh after form post.

```js
view.on('post', { action: 'new-post' }, async () => {
  // in the form you have to have a hidden field like this :
  // input(type='hidden', name='action', value='new-post')
  const { title, body, admin } = req.body;
  const input = { title, body, author: { connect: { id: admin } } };
  view
    .query(
      'created',
      `mutation createPost($input: PostCreateInput){
        createPost(data: $input) {id}
      }`,
      { variables: { input } }
    )
    .err(err => {
      console.log(err);
      locals.err = err;
    });
});
```
