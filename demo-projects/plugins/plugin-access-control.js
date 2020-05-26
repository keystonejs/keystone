const { or } = require('./combine-access-rules');
const { Relationship } = require('@keystonejs/fields');
const { singleton, byTracking, atTracking } = require('@keystonejs/list-plugins');

const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return { id: user.id };
};
const userIsAdmin = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return !!user.isAdmin;
};

const defaultSettingFieldAccess = { read: true, create: userIsAdmin, update: userIsAdmin };

const generateAccessControlPlugin = (listKey, { keystone, roleRef }) => {
  const settingRef = `${listKey}AccessSetting`;

  const listAccessRules = {
    userIsAdmin,
    userOwnsItem,
    userHasRole: accessType => async ({ authentication: { item: user, listKey: authList } }) => {
      if (!user) {
        return false;
      }

      // Get the list of roles
      const authListKey = keystone.lists[authList].gqlNames.itemQueryName;
      const {
        data: {
          [authList]: { roles },
        },
      } = await keystone.executeQuery(
        `query { ${authListKey}(where: { id: "${user.id}"}) { roles { id } } }`
      );

      // Query the settings list to see the users roles match allowable roles on the accessKey
      // ToDo: GQL for this should be different, singleton should not use allSettings or require id
      const allSettingsKey = keystone.lists[settingRef].gqlNames.listQueryName;
      const accessKey = `${listKey}${accessType}`;
      const {
        data: { allSettings },
      } = await keystone.executeQuery(`query {
        ${allSettingsKey} {
          ${accessKey}(where:{id_in: ${JSON.stringify(roles.map(role => role.id))} }) {
            id
            name
          }
        }
      }`);

      if (!allSettings) {
        return false;
      }

      return true;
    },
  };

  const hasRoles = config => {
    return {
      ...config,
      fields: {
        ...config.fields,
        roles: {
          type: Relationship,
          many: true,
          ref: roleRef,
          access: {
            read: true,
            create: userIsAdmin,
            update: userIsAdmin,
          },
        },
      },
    };
  };

  keystone.createList(settingRef, {
    fields: {
      [`${listKey}ReadAccess`]: {
        type: Relationship,
        many: true,
        ref: roleRef,
        access: defaultSettingFieldAccess,
      },
      [`${listKey}CreateAccess`]: {
        type: Relationship,
        many: true,
        ref: roleRef,
        access: defaultSettingFieldAccess,
      },
      [`${listKey}UpdateAccess`]: {
        type: Relationship,
        many: true,
        ref: roleRef,
        access: defaultSettingFieldAccess,
      },
      [`${listKey}DeleteAccess`]: {
        type: Relationship,
        many: true,
        ref: roleRef,
        access: defaultSettingFieldAccess,
      },
    },
    plugins: [singleton(), byTracking(), atTracking()],
  });

  const requiresRoles = config => {
    return {
      ...config,
      fields: {
        ...config.fields,
      },
      access: {
        read: or(
          listAccessRules.userHasRole('ReadAccess'),
          listAccessRules.userIsAdmin,
          listAccessRules.userOwnsItem
        ),
        create: or(
          listAccessRules.userHasRole('CreateAccess'),
          listAccessRules.userIsAdmin,
          listAccessRules.userOwnsItem
        ),
        update: or(
          listAccessRules.userHasRole('UpdateAccess'),
          listAccessRules.userIsAdmin,
          listAccessRules.userOwnsItem
        ),
        delete: or(
          listAccessRules.userHasRole('DeleteAccess'),
          listAccessRules.userIsAdmin,
          listAccessRules.userOwnsItem
        ),
      },
    };
  };
  return {
    hasRoles,
    requiresRoles,
  };
};

module.exports = { generateAccessControlPlugin, userIsAdmin, userOwnsItem };
