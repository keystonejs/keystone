import { createSchema, list } from '@keystone-spike/keystone/schema';
import { text, checkbox, password } from '@keystone-spike/fields';

/**
 * TODO: with the new session API, we're breaking keystone's current assumptions about the
 * `authentication` argument provided to access control functions. This will be a breaking change
 * for developers using Keystone.
 *
 * This needs to be implemented (replace `authentication` with `session`) before the code below
 * will work.
 *
 * While we're here I'd like to propose some other changes to improve the ergonomics; see the types
 * below for my proposal. Note that I'm specifically omitting the graphql context and any way of
 * executing queries because I'd like to review that API as well, separately (and we can add it in
 * later). This may be a bit contentious, but we need a new object anyway so I'm happy if in the
 * first pass we just implement ({ session, item }) argument so the code below works and we can
 * discuss the rest of the proposal as a group.
 *
 * Note that custom schema access control deviates significantly from the list and field access
 * control arguments; we need to revisit that in the context of how graphql schema extensions work
 * now. See https://www.keystonejs.com/api/access-control#custom-schema-access-control
 *
 * I also have questions about `originalInput` in the case of nested mutations (e.g creating an
 * item as the input to a relationship field). Is it the whole "original" input? Or just the nested
 * input for the relationship? Seems like it would have to be the second, but it's not clear from
 * the documentation. Is this consistent with how the `gqlName` argument works?
 *
 * tbh I'm inclined to remove the gqlName argument unless there's a compelling reason to have it;
 * esp. given it's marked as optional.
 *
 * Decisions:
 *
 * - We are not exposing the `auth` operation in access control config in the new interfaces
 */

type ItemId = string | number;
type GenericItem = { id: ItemId; [path: string]: any };
type Session = any; // we have this defined elsewhere
type Input = Record<string, any>;

type ListAccessInput = {
  session?: Session;
  listKey: string;
} & (
  | { operation: 'create'; input: Input }
  | { operation: 'read' }
  | { operation: 'update'; itemIds: ItemId[]; input: Input }
  | { operation: 'delete'; itemIds: ItemId[] }
);

type FieldAccessInput = {
  session?: Session;
  listKey: string;
  fieldPath: string;
} & (
  | { operation: 'create'; input: Input }
  | { operation: 'read'; item: GenericItem }
  | { operation: 'update'; item: GenericItem; input: Input }
);

export const lists = createSchema({
  User: list({
    access: {
      // Only allow admins to delete users
      delete: ({ session }) => session?.item?.isAdmin,
    },
    admin: {
      // Since you can't delete users unless you're an admin, we hide the UI for it
      hideDelete: ({ session }) => !session?.item?.isAdmin,
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
            session && (session.item.isAdmin || session.itemId === item.id),
        },
        admin: {
          // Based on the same logic as update access, the password field is editable.
          // The password field is hidden from non-Admin users (except for themselves)
          itemView: {
            fieldMode: ({ session, item }) =>
              session && (session.item.isAdmin || session.itemId === item.id) ? 'edit' : 'hidden',
          },
        },
      }),
      // This is used for access control, both in the schema and for the Admin UI
      isAdmin: checkbox({
        access: {
          // Only Admins can change the isAdmin flag for any users
          update: ({ session }) => session?.item.isAdmin,
        },
        admin: {
          // All users can see the isAdmin status, only admins can change it
          itemView: {
            fieldMode: ({ session }) => (session?.item.isAdmin ? 'edit' : 'read'),
          },
        },
      }),
      // This controls whether users can sign in or not
      isEnabled: checkbox({
        access: {
          // Only Admins can change the isEnabled flag for any users
          update: ({ session }) => session?.item.isAdmin,
        },
        admin: {
          // All users can see the isEnabled status, only admins can change it
          itemView: {
            fieldMode: ({ session }) => (session?.item.isAdmin ? 'edit' : 'read'),
          },
        },
      }),
    },
  }),
});
