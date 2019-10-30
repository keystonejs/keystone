# Demo Project: Blog

This is the Blog, a Demo Project for Keystone. Compared to the todo list, it is more complex and contains more features that really showcase the power of Keystone - one of which is 'relationships'. The Blog contains four lists - Posts, Post Categories, Users and Comments. Users can create Comments that relate to a certain Post, and Admins can create Posts that can relate to one or more Post Categories.

The Blog is a great example and boilerplate for more complex, real-world implementations of Keystone.

## Running the Project.

To run this project, open your terminal and run `yarn` within the Keystone project root to install all required packages, then run `yarn start blog` to begin running Keystone.

The Keystone Admin UI is reachable from `localhost:3000/admin`. To log in, use the following credentials:

Username: `admin@keystonejs.com`
Password: `password`

To see an example Next.js app using KeystoneJS' GraphQl APIs, head to `localhost:3000`.

You can change the port that this demo runs on by setting the `PORT` environment variable.

```sh
PORT=5000 yarn start blog
```

## TODO: Permissions and Authorisation

Although the "Password" auth strategy is enabled for the Admin UI on this project, we haven't implemented any restrictions on the GraphQL API yet. So unauthenticated users are able to create and destroy admin users (!)

See the [Access Control](https://keystonejs.com/guides/access-control) documentation for information on how to do this.
