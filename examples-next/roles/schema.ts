import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, password, relationship, text } from '@keystone-next/fields';

/*
  The set of permissions a role could have would change based on application requirements, so the
  checkboxes in the Role list below are fairly arbitary to demonstrate the idea.

  The default permissions (not assigned with roles) in this example are:
  - All users can sign into the Admin UI
  - All users can see and manage todo items assigned to themselves
*/

export const lists = createSchema({
  Todo: list({
    /*
      SPEC
      - [ ] Block all public access
      - [ ] Restrict list create based on canCreateTodos
      - [ ] Restrict list read based on canManageAllTodos and isPrivate
        - [ ] Users without canManageAllTodos can only see their own todo items
        - [ ] Users can never see todo items with isPrivate unless assigned to themselves
      - [ ] Restrict list update / delete based on canManageAllTodos
        - [ ] Users can always update / delete their own todo items with canManageAllTodos
        - [ ] Users can only update / delete todo items assigned to other people with canManageAllTodos
      - [ ] Validate assignment on create based on canManageAllTodos
        - [ ] Users without canManageAllTodos can only create Todos assigned to themselves
        - [ ] Users with canManageAllTodos can create and assign Todos to anyone
    */
    ui: {
      listView: {
        initialColumns: ['label', 'isComplete', 'assignedTo'],
      },
    },
    fields: {
      /* The label of the todo item */
      label: text({ isRequired: true }),
      /* Whether the todo item is complete */
      isComplete: checkbox(),
      /* Private todo items are only visible to the user they are assigned to */
      isPrivate: checkbox(),
      /* The person the todo item is assigned to */
      assignedTo: relationship({ ref: 'Person.tasks' }),
    },
  }),
  Person: list({
    /*
      SPEC
      - [ ] Block all public access
      - [ ] Restrict list create based on canManagePeople
      - [ ] Restrict list read based on canSeeOtherPeople
      - [ ] Restrict list update based on canEditOtherPeople
      - [ ] Restrict list delete based on canManagePeople
      - [ ] Restrict role field update based on canManagePeople
      - [ ] Restrict password field update based on same item or canManagePeople
    */
    ui: {
      listView: {
        initialColumns: ['name', 'role', 'tasks'],
      },
    },
    fields: {
      /* The name of the user */
      name: text({ isRequired: true }),
      /* The email of the user, used to sign in */
      email: text({ isRequired: true }),
      /* The password of the user */
      password: password({ isRequired: true }),
      /* The role assigned to the user */
      role: relationship({
        ref: 'Role.assignedTo',
      }),
      /* Todo items assigned to the user */
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
    /*
      SPEC
      - [ ] Block all public access
      - [ ] Restrict all access based on canManageRoles
      - [ ] Prevent users from deletig their own role
      - [ ] Add a pre-save hook that ensures some permissions are selected when others are:
          - [ ] when canEditOtherPeople is true, canSeeOtherPeople must be true
          - [ ] when canManagePeople is true, canEditOtherPeople and canSeeOtherPeople must be true
      - [ ] Extend the Admin UI with client-side validation based on the same set of rules
    */
    fields: {
      /* The name of the role */
      name: text(),
      /* Create Todos means:
         - create todos (can only assign them to others with canManageAllTodos) */
      canCreateTodos: checkbox(),
      /* Manage All Todos means:
         - create new Todo items and assign them to someone else (with canCreateTodos)
         - update and delete Todo items not assigned to the current user */
      canManageAllTodos: checkbox(),
      /* See Other Users means:
         - list all users in the database (users can always see themselves) */
      canSeeOtherPeople: checkbox(),
      /* Edit Other Users means:
         - edit other users in the database (users can always edit their own item) */
      canEditOtherPeople: checkbox(),
      /* Manage Users means:
         - change passwords (users can always change their own password)
         - assign roles to themselves and other users */
      canManagePeople: checkbox(),
      /* Manage Roles means:
         - create, edit, and delete roles */
      canManageRoles: checkbox(),
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
});
