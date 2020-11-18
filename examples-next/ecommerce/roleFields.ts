import { checkbox, relationship, text } from '@keystone-next/fields';

export const roleFields = {
  /* The name of the role */
  name: text({ isRequired: true }),
  canCreateProducts: checkbox({
    defaultValue: true,
    label: 'User can create a new product',
  }),
  canManageAllProducts: checkbox({
    defaultValue: false,
    label: 'User can Update and delete any product'
  }),
  canSeeOtherUsers: checkbox({
    defaultValue: false,
    label: 'User can query other users'
  }),
  canEditOtherUsers: checkbox({
    defaultValue: false,
    label: 'User can Edit other users'
  }),
  canManageRoles: checkbox({ defaultValue: false, label: 'User can CRUD roles' }),
  canManageCart: checkbox({ defaultValue: false, label: 'User can see and manage cart and cart items' }),
  canManageOrders: checkbox({ defaultValue: false, label: 'User can see and manage orders' }),
    /* This list of People assigned to this role */
  assignedTo: relationship({
    ref: 'User.role',
    many: true,
    ui: {
      itemView: { fieldMode: 'read' },
    },
  })
};

export const permissionsList: string[] = Object.keys(roleFields).filter(field => field.startsWith('can'));
