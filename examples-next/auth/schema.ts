import { createSchema, list } from '@keystone-next/keystone/schema';
import { text, checkbox, password } from '@keystone-next/fields';

export const lists = createSchema({
  User: list({
    access: {
      // Only allow admins to delete users
      delete: ({ session }) => session?.data?.isAdmin,
    },
    admin: {
      // Since you can't delete users unless you're an admin, we hide the UI for it
      hideDelete: ({ session }) => !session?.data?.isAdmin,
      listView: {
        // These are the default columns that will be displayed in the list view
        initialColumns: ['name', 'email', 'isAdmin'],
      },
    },
    fields: {
      // The user's name
      name: text({ isRequired: true }),
      // The user's email address, used as the identity field for auth
      email: text({
        isRequired: true,
        isUnique: true,
      }),
      // The user's password, used as the secret field for auth
      password: password({
        access: {
          // Passwords can always be set when creating items
          // Users can change their own passwords, and Admins can change anyone's password
          update: ({ session, item }) =>
            session && (session.data.isAdmin || session.itemId === item.id),
        },
        admin: {
          // Based on the same logic as update access, the password field is editable.
          // The password field is hidden from non-Admin users (except for themselves)
          // createView: {
          //   fieldMode: ({ session }) => (session?.data?.isAdmin ? 'edit' : 'hidden'),
          // },
          itemView: {
            fieldMode: ({ session, item }) =>
              session && (session.data.isAdmin || session.itemId === item.id) ? 'edit' : 'hidden',
          },
          listView: {
            fieldMode: ({ session }) => (session?.item?.isAdmin ? 'read' : 'hidden'),
          },
        },
      }),
      // This is used for access control, both in the schema and for the Admin UI
      isAdmin: checkbox({
        access: {
          // Only Admins can set the isAdmin flag for any users
          // create: ({ session }) => session?.data.isAdmin,
          update: ({ session }) => session?.data.isAdmin,
        },
        admin: {
          // All users can see the isAdmin status, only admins can change it
          // createView: {
          //   fieldMode: ({ session }) => (session?.data.isAdmin ? 'edit' : 'hidden'),
          // },
          itemView: {
            fieldMode: ({ session }) => (session?.data.isAdmin ? 'edit' : 'read'),
          },
        },
      }),
      /* TODO: Come back to this when we review how to restrict signin to valid users
      // This controls whether users can sign in or not
      isEnabled: checkbox({
        access: {
          // Only Admins can change the isEnabled flag for any users
          // create: ({ session }) => session?.data.isAdmin,
          update: ({ session }) => session?.data.isAdmin,
        },
        admin: {
          // All users can see the isEnabled status, only admins can change it
          itemView: {
            fieldMode: ({ session }) => (session?.data.isAdmin ? 'edit' : 'read'),
          },
        },
      }),
      */
    },
  }),
});
