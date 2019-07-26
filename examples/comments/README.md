# Example

This is the todo list - the simplest implementation of Keystone. The todo list allows you to see what the minimum requirements are for running Keystone. Look at the `index.js` file to see how the list is configured. It has no fancy extras and only one list - easy peasy!

In addition to the Admin application, this project includes a static front-end application, housed within the `/public` directory. It allows you to see how easy it is to create an app that uses Keystone's GraphQL APIs.

## Running the Project.

To run this demo project, all you need to do is run `npm install` within the Keystone project root to install all required packages, then run `bolt start todo` to begin running Keystone.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`. To see an example React app using Keystone's GraphQl APIs, head to `localhost:3000`.

You can change the port that this application runs on by setting the `PORT` environment variable.
