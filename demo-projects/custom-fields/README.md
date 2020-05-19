# Demo Project: Custom Fields

A demo project to help people create custom fields.

The Stars field is a simple extension of the Integer field to provide a "star rating" interface.

The `MultiCheck` field is a more complicated field that store a stringified JSON object. The Controller and Implementation files demonstrate different methods for overriding behaviour in the Admin UI and GraphQL.

## Running the Project.

To run this demo project, run `yarn` within the Keystone project root to install all required packages, then run `yarn demo custom-fields` to begin running Keystone.

Once running, the Keystone Admin UI is reachable from `localhost:3000/admin`. To see an example React app using KeystoneJS' GraphQl APIs, head to `localhost:3000`.

You can change the port that this application runs on by setting the `PORT` environment variable.

```sh
PORT=5000 yarn start custom-fields
```
