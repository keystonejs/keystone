---
'@keystonejs/keystone': major
---

Fixed `configureExpress(app)` to work properly when customizing the `express` instance. Earlier the configuration passed to express instance inside `configureExpress` were lost.

**breaking changes**: You must return the express instance from `configureExpress` function.

example:
```js
const configureExpress = (app) => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set('views', './templates');
  app.set('view engine', 'pug');
// ... other custom work with app
  return app; // required to return the instance.
}
```
