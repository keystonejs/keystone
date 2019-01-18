# Demo Project - Todo List

This is the todo list - the simplest implementation of Keystone. The todo list allows you to see what the minimum requirements are for running Keystone. It has no fancy extras and only one list - easy peasy!

## Running the Project.

To run this demo project, all you need to do is run `bolt` within the Keystone project root to install all required packages, then run `bolt start todo` to begin running Keystone.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`. To see an example React app using Keystone's GraphQl APIs, head to `localhost:3000`.

## Demo React App

The one 'extra' that this project includes is an example React App that consumes the data from Keystone via GraphQl and Apollo. The app is bundled together by Parcel, and is housed within the `/public` directory. It allows you to see how easy it is to create an app that can use Keystone's GraphQL APIs.

If you wanted to deactivate the example app to rebuild it, or run your app independently of Keystone, just remove any of the imports related to the app in `/index.js`, as well as this line...

```js
// remove this line from index.js to disable the example React app.
server.app.use(bundler.middleware());
```
