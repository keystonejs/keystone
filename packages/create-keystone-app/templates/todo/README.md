# Starter Project - Todo List

This is the todo list - the simplest implementation of Keystone. The todo list allows you to see what the minimum requirements are for running Keystone. It has no fancy extras and only one list - easy peasy!

## Running the Project.

To run this project, all you need to do is run `yarn` within the project root to install all required packages, then run `yarn start` to begin running this Keystone app.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`. To see an example React app using Keystone's GraphQl APIs, head to `localhost:3000`.

You can change the port that this application runs on by setting the `PORT` environment variable.

```sh
PORT=5000 yarn start
```

## React App

The one 'extra' that this project includes is an example React App that consumes the data from Keystone via GraphQl. The app uses React's UMD build and is housed within the `/public` directory. It allows you to see how easy it is to create an app that can use Keystone's GraphQL APIs.

## Custom Server

This project includes a _Custom Server_ in `server.js`. It is used to serve the react app only. If you wish to run Keystone as an API & AdminUI only, you can safely delete `server.js` (and the `/public` directory).
