const { Keystone, PasswordAuthStrategy } = require("@keystone-alpha/keystone");
const { Text, Checkbox, Password } = require("@keystone-alpha/fields");
const { GraphQLApp } = require("@keystone-alpha/app-graphql");
const { AdminUIApp } = require("@keystone-alpha/app-admin-ui");
/* keystone-cli: generated-code */
const {
  MongooseAdapter: Adapter
} = require("@keystone-alpha/adapter-mongoose");
const PROJECT_NAME = "My KeystoneJS Project";
/* /keystone-cli: generated-code */

/**
 * You've got a new KeystoneJS Project! Things you might want to do next:
 * - Add a real adapter config (See: https://v5.keystonejs.com/keystone-alpha/adapter-mongoose/)
 * - Select configure access control and authentication (See: https://v5.keystonejs.com/api/access-control)
 * - Change your session (See: https://v5.keystonejs.com/api/access-control)
 */

const keystone = new Keystone({
  name: PROJECT_NAME,
  // See: http://ksguide/cli/adapterConfig
  adapter: new Adapter()
});

const access = {
  userIsAdmin: ({ authentication: { item: user } }) =>
    Boolean(user && user.isAdmin),
  userOwnsItem: ({ authentication: { item: user } }) => {
    if (!user) {
      return false;
    }
    return { id: user.id };
  }
};

keystone.createList("User", {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
      access: { read: access.userOwnsItem }
    },
    isAdmin: { type: Checkbox },
    password: { type: Password, access: { update: access.userIsAdmin } }
  },
  access: {
    update: auth => {
      const isAdmin = access.userIsAdmin(auth);
      const isOwner = access.userOwnsItem(auth);
      return isAdmin ? isAdmin : isOwner;
    },
    delete: access.userIsAdmin
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
    new AdminUIApp({ enableDefaultRoute: true, authStrategy })
  ]
};
