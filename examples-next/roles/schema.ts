import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, password, relationship, text } from '@keystone-next/fields';

/*
  This example demostrates how you can set up a powerful, custom roles-based access control system
  with Keystone for an otherwise very simple to-do app. Roles are stored in a list, and each user
  is related to a role. Each role has a granular set of permissions selected from the avialable
  checkboxes.

  The set of permissions a role could have would change based on application requirements, so the
  checkboxes in the Role list below are fairly arbitary to demonstrate the idea.

  The intended behaviour of this specific example is:
  - All users can sign into the Admin UI
  - All users can see todo items assigned to themselves
*/

export const lists = createSchema({
  Todo: list({
    ui: {
      listView: {
        initialColumns: ['label', 'isComplete', 'assignedTo'],
      },
    },
    fields: {
      /*
        The label of the todo item
      */
      label: text({ isRequired: true }),
      /*
        Whether the todo item is complete
      */
      isComplete: checkbox(),
      /*
        Private todo items are only visible to the user they are assigned to
      */
      isPrivate: checkbox(),
      /*
        The person the todo item is assigned to
      */
      assignedTo: relationship({ ref: 'Person.tasks' }),
    },
  }),
  Person: list({
    ui: {
      listView: {
        initialColumns: ['name', 'role', 'tasks'],
      },
    },
    fields: {
      /*
        The name of the user
      */
      name: text({ isRequired: true }),
      /*
        The email of the user, used to sign in
      */
      email: text(),
      /*
        The password of the user
      */
      password: password(),
      /*
        The role assigned to the user
      */
      role: relationship({
        ref: 'Role.assignedTo',
      }),
      /*
        Todo items assigned to the user
      */
      tasks: relationship({
        ref: 'Todo.assignedTo',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
  Role: list({
    fields: {
      /*
        The name of the role
      */
      name: text(),
      /*
        Create Todos means:
        - create todos (can only assign them with canManageOwnTodos or canManageAllTodos)
      */
      canCreateTodos: checkbox(),
      /*
        Manage Own Todos means:
        - create new self-assigned Todo items (with canCreateTodos)
        - update and delete Todo items assigned to the current user
      */
      canManageOwnTodos: checkbox(),
      /*
        Manage All Todos means:
        - create new Todo items and assign them to someone else (with canCreateTodos)
        - update and delete Todo items not assigned to the current user
      */
      canManageAllTodos: checkbox(),
      /*
        See Other Users means:
        - list all users in the database (users can always see themselves)
      */
      canSeeOtherUsers: checkbox(),
      /*
        Edit Other Users means:
        - edit other users in the database (users can always edit their own item)
      */
      canEditOtherUsers: checkbox(),
      /*
        Manage Users means:
        - change passwords (users can always change their own password)
        - assign roles to themselves and other users
      */
      canManageUsers: checkbox(),
      /*
        Manage Roles means:
        - create, edit, and delete roles
      */
      canManageRoles: checkbox(),
      /*
        This list of People assigned to this role
      */
      assignedTo: relationship({
        ref: 'Person.role',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
});
