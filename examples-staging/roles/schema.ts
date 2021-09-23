import { list } from '@keystone-next/keystone';
import { checkbox, password, relationship, text } from '@keystone-next/keystone/fields';

import { isSignedIn, permissions, rules } from './access';

/*
  The set of permissions a role could have would change based on application requirements, so the
  checkboxes in the Role list below are fairly arbitary to demonstrate the idea.

  The default permissions (not assigned with roles) in this example are:
  - All users can sign into the Admin UI
  - All users can see and manage todo items assigned to themselves
*/

export const lists = {
  Todo: list({
    /*
      SPEC
      - [x] Block all public access
      - [x] Restrict list create based on canCreateTodos
      - [x] Restrict list read based on canManageAllTodos and isPrivate
        - [x] Users without canManageAllTodos can only see their own todo items
        - [x] Users can never see todo items with isPrivate unless assigned to themselves
      - [x] Restrict list update / delete based on canManageAllTodos
        - [x] Users can always update / delete their own todo items
        - [x] Users can only update / delete todo items assigned to other people with canManageAllTodos
      - [ ] Validate assignment on create based on canManageAllTodos
        - [ ] Users without canManageAllTodos can only create Todos assigned to themselves
        - [ ] Users with canManageAllTodos can create and assign Todos to anyone
        - [ ] Nobody can create private users assigned to another user
      - [ ] Extend the Admin UI to stop people creating private Todos assigned to someone else
    */
    access: {
      operation: {
        create: permissions.canCreateTodos,
      },
      filter: {
        query: rules.canReadTodos,
        update: rules.canManageTodos,
        delete: rules.canManageTodos,
      },
    },
    ui: {
      hideCreate: args => !permissions.canCreateTodos(args),
      listView: {
        initialColumns: ['label', 'isComplete', 'assignedTo'],
      },
    },
    fields: {
      /* The label of the todo item */
      label: text({ isRequired: true }),
      /* Whether the todo item is complete */
      isComplete: checkbox({ defaultValue: false }),
      /* Private todo items are only visible to the user they are assigned to */
      isPrivate: checkbox({ defaultValue: false }),
      /* The person the todo item is assigned to */
      assignedTo: relationship({
        ref: 'Person.tasks',
        ui: {
          createView: {
            fieldMode: args => (permissions.canManageAllTodos(args) ? 'edit' : 'hidden'),
          },
          itemView: {
            fieldMode: args => (permissions.canManageAllTodos(args) ? 'edit' : 'read'),
          },
        },
        hooks: {
          resolveInput({ operation, resolvedData, context }) {
            if (operation === 'create' && !resolvedData.assignedTo) {
              // Always default new todo items to the current user; this is important because users
              // without canManageAllTodos don't see this field when creating new items
              return { connect: { id: context.session.itemId } };
            }
            return resolvedData.assignedTo;
          },
        },
      }),
    },
  }),
  Person: list({
    /*
      SPEC
      - [x] Block all public access
      - [x] Restrict list create based on canManagePeople
      - [x] Restrict list read based on canSeeOtherPeople
      - [x] Restrict list update based on canEditOtherPeople
      - [x] Restrict list delete based on canManagePeople
      - [x] Restrict role field update based on canManagePeople
      - [x] Restrict password field update based on same item or canManagePeople
      - [x] Restrict tasks based on same item or canManageTodos
    */
    access: {
      operation: {
        create: permissions.canManagePeople,
        delete: permissions.canManagePeople,
      },
      filter: {
        query: rules.canReadPeople,
        update: rules.canUpdatePeople,
      },
    },
    ui: {
      hideCreate: args => !permissions.canManagePeople(args),
      hideDelete: args => !permissions.canManagePeople(args),
      listView: {
        initialColumns: ['name', 'role', 'tasks'],
      },
      itemView: {
        defaultFieldMode: ({ session, item }) => {
          // People with canEditOtherPeople can always edit people
          if (session.data.role?.canEditOtherPeople) return 'edit';
          // People can also always edit themselves
          else if (session.itemId === item.id) return 'edit';
          // Otherwise, default all fields to read mode
          return 'read';
        },
      },
    },
    fields: {
      /* The name of the user */
      name: text({ isRequired: true }),
      /* The email of the user, used to sign in */
      email: text({ isRequired: true, isIndexed: 'unique', isFilterable: true }),
      /* The password of the user */
      password: password({
        isRequired: true,
        access: {
          update: ({ session, item }) =>
            permissions.canManagePeople({ session }) || session.itemId === item.id,
        },
      }),
      /* The role assigned to the user */
      role: relationship({
        ref: 'Role.assignedTo',
        access: {
          create: permissions.canManagePeople,
          update: permissions.canManagePeople,
        },
        ui: {
          itemView: {
            fieldMode: args => (permissions.canManagePeople(args) ? 'edit' : 'read'),
          },
        },
      }),
      /* Todo items assigned to the user */
      tasks: relationship({
        ref: 'Todo.assignedTo',
        many: true,
        access: {
          // Only people with canManageAllTodos can set this field when creating other users
          create: permissions.canManageAllTodos,
          // You can only update this field with canManageAllTodos, or for yourself
          update: ({ session, item }) =>
            permissions.canManageAllTodos({ session }) || session.itemId === item.id,
        },
        ui: {
          createView: {
            // Note you can only see the create view if you can manage people, so we just need to
            // check the canManageAllTodos permission here
            fieldMode: args => (permissions.canManageAllTodos(args) ? 'edit' : 'hidden'),
          },
          // Todo lists can be potentially quite large, so it's impractical to edit this field in
          // the item view. Always set it to read mode.
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
  Role: list({
    /*
      SPEC
      - [x] Block all public access
      - [x] Restrict edit access based on canManageRoles
      - [ ] Prevent users from deleting their own role
      - [ ] Add a pre-save hook that ensures some permissions are selected when others are:
          - [ ] when canEditOtherPeople is true, canSeeOtherPeople must be true
          - [ ] when canManagePeople is true, canEditOtherPeople and canSeeOtherPeople must be true
      - [ ] Extend the Admin UI with client-side validation based on the same set of rules
    */
    access: {
      operation: {
        create: permissions.canManageRoles,
        query: isSignedIn,
        update: permissions.canManageRoles,
        delete: permissions.canManageRoles,
      },
    },
    ui: {
      hideCreate: args => !permissions.canManageRoles(args),
      hideDelete: args => !permissions.canManageRoles(args),
      listView: {
        initialColumns: ['name', 'assignedTo'],
      },
      itemView: {
        defaultFieldMode: args => (permissions.canManageRoles(args) ? 'edit' : 'read'),
      },
    },
    fields: {
      /* The name of the role */
      name: text({ isRequired: true }),
      /* Create Todos means:
         - create todos (can only assign them to others with canManageAllTodos) */
      canCreateTodos: checkbox({ defaultValue: false }),
      /* Manage All Todos means:
         - create new Todo items and assign them to someone else (with canCreateTodos)
         - update and delete Todo items not assigned to the current user */
      canManageAllTodos: checkbox({ defaultValue: false }),
      /* See Other Users means:
         - list all users in the database (users can always see themselves) */
      canSeeOtherPeople: checkbox({ defaultValue: false }),
      /* Edit Other Users means:
         - edit other users in the database (users can always edit their own item) */
      canEditOtherPeople: checkbox({ defaultValue: false }),
      /* Manage Users means:
         - change passwords (users can always change their own password)
         - assign roles to themselves and other users */
      canManagePeople: checkbox({ defaultValue: false }),
      /* Manage Roles means:
         - create, edit, and delete roles */
      canManageRoles: checkbox({ defaultValue: false }),
      /* This list of People assigned to this role */
      assignedTo: relationship({
        ref: 'Person.role',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
};
