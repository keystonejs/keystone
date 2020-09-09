# demo project: Content

This demo project showcase the usage of **Document** Field—a rich text editor. It has the following listed functionality: 
- Heading (h1, h2, and h3)
- Ordered and Unordered list
- Code
- Bold and Italics
- Access Boundary (allow setting access visibility to text content)
- Panel
- Quote
- Two and three column layout

## Running the Project.

To run this demo project, all you need to do is run `yarn` within the Keystone project root to install all required packages, then run `yarn demo content` to begin running Keystone.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`. To see an example React app using KeystoneJS' GraphQl APIs, head to `localhost:3000`.

You can change the port that this application runs on by setting the `PORT` environment variable.

```sh
PORT=5000 yarn start todo
```

## TODO: Permissions and Authorisation

Although the "Password" auth strategy is enabled for the Admin UI on this project, we haven't implemented any restrictions on the GraphQL API yet. So you can create users with desired password to get started.
