const { Keystone, PasswordAuthStrategy } = require("@keystone-alpha/keystone");
const { Text, Checkbox } = require("@keystone-alpha/fields");
const { GraphQLApp } = require("@keystone-alpha/app-graphql");
const { AdminUIApp } = require("@keystone-alpha/app-admin-ui");
const { StaticApp } = require("@keystone-alpha/app-static");

/* keystone-cli: generated-code */
const {
  MongooseAdapter: Adapter
} = require("@keystone-alpha/adapter-mongoose");
const PROJECT_NAME = "My KeystoneJS Project";
/* /keystone-cli: generated-code */

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter(),
  onConnect: async () => {
    // This initial user is created as a convenience
    // Delete this section after launching Keystone and changing the email/password in the AdminUI
    try {
      keystone.createItems({
        User: [
          {
            name: "Admin",
            email: "admin@keystonejs.com",
            password: "correcthorsebatterystaple"
          }
        ]
      });
    } catch (err) {}
  }
});

const userIsLoggedIn = ({ authentication: { item } }) => !!item;

keystone.createList("User", {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Text }
  },
  access: userIsLoggedIn // Only authenticated users can access access this list
});

keystone.createList("Comment", {
  fields: {
    name: { type: Text },
    comment: { type: Text },
    path: { type: Text },
    approved: { type: Checkbox, access: userIsLoggedIn } // We don't want users to be able to approve their own comments
  },
  access: {
    read: ({ authentication: { item } }) => {
      // If the user is logged in return all comments
      if (item) {
        return {};
      }
      // If the user is not logged in, return only approved comments
      return {
        approved: true
      };
    },
    create: true,
    update: userIsLoggedIn,
    update: userIsLoggedIn
  }
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: "User"
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: "/", src: "public" }),
    new AdminUIApp({ enableDefaultRoute: true, authStrategy })
  ]
};
