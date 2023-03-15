import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, checkbox, password } from '@keystone-6/core/fields';
import type { Lists } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

type Session = {
  itemId: string;
  data: {
    isAdmin: boolean;
  };
};

function hasSession({ session }: { session: Session | undefined }) {
  return Boolean(session);
}

function isAdminOrSameUser({
  session,
  item,
}: {
  session: Session | undefined;
  item: Lists.User.Item;
}) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.isAdmin) return true;

  // the authenticated user needs to be equal to the user we are updating
  return session.itemId === item.id;
}

function isAdminOrSameUserFilter({ session }: { session: Session | undefined }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can see everything
  if (session.data?.isAdmin) return {};

  // the authenticated user can only see themselves
  return {
    id: {
      equals: session.itemId,
    },
  };
}

function isAdmin({ session }: { session: Session | undefined }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.isAdmin) return true;

  // otherwise, no
  return false;
}

export const lists: Lists = {
  User: list({
    access: {
      operation: {
        create: allowAll,
        query: allowAll,

        // only allow users to update _anything_, but what they can update is limited by
        //   the access.filter.* and access.item.* access controls
        update: hasSession,

        // only allow admins to delete users
        delete: isAdmin,
      },
      filter: {
        update: isAdminOrSameUserFilter,
      },
      item: {
        // this is redundant as ^filter.update should prevent unauthorised updates
        //   we include it anyway as a demonstration
        update: isAdminOrSameUser,
      },
    },
    ui: {
      // only show deletion options for admins
      hideDelete: args => !isAdmin(args),
      listView: {
        // the default columns that will be displayed in the list view
        initialColumns: ['name', 'email', 'isAdmin'],
      },
    },
    fields: {
      // the user's name, publicly visible
      name: text({ validation: { isRequired: true } }),

      // the user's email address, used as the identity field for authentication
      //   should not be publicly visible
      //
      //   we use isIndexed to enforce this email is unique
      email: text({
        access: {
          // only the respective user, or an admin can read this field
          read: isAdminOrSameUser,

          // only admins can update this field
          update: isAdmin,
        },
        isFilterable: false,
        isOrderable: false,
        isIndexed: 'unique',
        validation: {
          isRequired: true,
        },
      }),

      // the user's password, used as the secret field for authentication
      //   should not be publicly visible
      password: password({
        access: {
          read: isAdminOrSameUser, // TODO: is this required?
          update: isAdminOrSameUser,
        },
        ui: {
          itemView: {
            // don't show this field if it isn't relevant
            fieldMode: args => (isAdminOrSameUser(args) ? 'edit' : 'hidden'),
          },
          listView: {
            // TODO: ?
            fieldMode: args => (isAdmin(args) ? 'read' : 'hidden'),
          },
        },
      }),

      // a flag to indicate if this user is an admin
      //  should not be publicly visible
      isAdmin: checkbox({
        access: {
          // only the respective user, or an admin can read this field
          read: isAdminOrSameUser,

          // only admins can create, or update this field
          create: isAdmin,
          update: isAdmin,
        },
        defaultValue: false,
        ui: {
          // only admins can edit this field
          createView: {
            fieldMode: args => (isAdmin(args) ? 'edit' : 'hidden'),
          },
          itemView: {
            fieldMode: args => (isAdmin(args) ? 'edit' : 'read'),
          },
        },
      }),
    },
  }),
};
