// @ts-ignore
import { getItem, getItems, deleteItems } from '@keystonejs/server-side-graphql-client';
import { createSchema, list, graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { text, relationship, password, select, virtual, integer, checkbox } from '@keystone-next/fields';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import type { ListsAPI, AccessControl } from './types';
import { permissions, isSignedIn, rules } from './access';

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_KEY || '',
  apiSecret: process.env.CLOUDINARY_SECRET || '',
};

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatMoney(cents: number) {
  const dollars = cents / 100;
  return formatter.format(dollars);
}

export const lists = createSchema({
  User: list({
    access: {
      // anyone should be able to create a user (sign up)
      create: true,
      // only admins can see the list of users
      read: true,
      update: true,
      delete: permissions.can('AcessUsers'),
    },
    ui: {
      // only admins can create and delete users in the Admin UI
      hideCreate: args => !permissions.can('UpdateUsers')(args),
      hideDelete: args => !permissions.can('UpdateUsers')(args),
      listView: {
        initialColumns: ['name', 'email'],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password(),
      cart: relationship({
        ref: 'CartItem.user',
        many: true,
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      role: relationship({
        ref: 'Role.assignedTo',
        access: {
          create: permissions.can('ManagePeople'),
          update: permissions.can('ManagePeople'),
        },
        ui: {
          itemView: {
            fieldMode: args => (permissions.can('ManageUsers')(args) ? 'edit' : 'read'),
          },
        },
      }),
    },
  }),
  Product: list({
    // TODO: Product Access
    access: {
      create: isSignedIn,
      read: true,
      update: rules.canManageProducts,
      delete: rules.canManageProducts,
    },
    fields: {
      name: text({ isRequired: true }),
      permissions: select({
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Available', value: 'AVAILABLE' },
          { label: 'Unavailable', value: 'UNAVAILABLE' },
        ],
        defaultValue: 'DRAFT',
        ui: {
          displayMode: 'segmented-control',
          createView: { fieldMode: 'hidden' },
        },
      }),
      description: text({ ui: { displayMode: 'textarea' } }),
      price: integer(),
      image: relationship({
        ref: 'ProductImage.product',
        ui: {
          createView: { fieldMode: 'hidden' },
          displayMode: 'cards',
          cardFields: ['image', 'altText'],
          inlineCreate: { fields: ['image', 'altText'] },
          inlineEdit: { fields: ['altText'] },
        },
      }),
      author: relationship({ ref: 'User' }),
    },
  }),
  ProductImage: list({
    // TODO Access product image
    // access: {
    //   create: access.userIsAdminOrEditor,
    //   read: true,
    //   update: access.userIsAdminOrEditor,
    //   delete: access.userIsAdminOrEditor,
    // },
    ui: {
      isHidden: true,
    },
    fields: {
      product: relationship({ ref: 'Product.image' }),
      image: cloudinaryImage({
        cloudinary,
        label: 'Source',
      }),
      altText: text(),
    },
  }),
  CartItem: list({
    fields: {
      label: virtual({
        graphQLReturnType: 'String',
        resolver: async (cartItem, args, ctx) => {
          const lists: ListsAPI = ctx.lists;
          if (!cartItem.product) {
            return `🛒 ${cartItem.quantity} of (invalid product)`;
          }
          let product = await lists.Product.findOne({
            where: { id: String(cartItem.product) },
          });
          if (product?.name) {
            return `🛒 ${cartItem.quantity} of ${product.name}`;
          }
          return `🛒 ${cartItem.quantity} of (invalid product)`;
        },
      }),
      quantity: integer({
        defaultValue: 1,
        isRequired: true,
      }),
      product: relationship({ ref: 'Product' /* , isRequired: true */ }),
      user: relationship({ ref: 'User.cart' /* , isRequired: true */ }),
    },
  }),
  Order: list({
    ui: {
      listView: { initialColumns: ['label', 'user', 'items'] },
    },
    fields: {
      label: virtual({
        graphQLReturnType: 'String',
        resolver: item => formatMoney(item.total),
      }),
      total: integer(),
      items: relationship({ ref: 'OrderItem', many: true }),
      user: relationship({ ref: 'User' }),
      charge: text(),
    },
  }),
  OrderItem: list({
    fields: {
      name: text({ isRequired: true }),
      description: text({ ui: { displayMode: 'textarea' } }),
      price: integer(),
      quantity: integer({ isRequired: true }),
      image: relationship({
        ref: 'ProductImage',
        ui: { displayMode: 'cards', cardFields: ['image'] },
      }),
    },
  }),
  Role: list({
    access: {
      create: permissions.can('ManageRoles'),
      read: permissions.can('ManageRoles'),
      update: permissions.can('ManageRoles'),
      delete: permissions.can('ManageRoles'),
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
      canCreateProducts: checkbox({
        defaultValue: true,
        label: 'User can create a new product',
       }),
      canManageAllProducts: checkbox({ defaultValue: false, label: 'User can Update and delete any product' }),
      canSeeOtherUsers: checkbox({ defaultValue: false, label: 'User can query other users'
       }),
      canEditOtherUsers: checkbox({ defaultValue: false, label: 'User can Edit other users' }),
      canManageRoles: checkbox({ defaultValue: false, label: 'User can CRUD roles' }),
      /* This list of People assigned to this role */
      assignedTo: relationship({
        ref: 'User.role',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      })
  } }),
});

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Mutation {
      addToCart(productId: ID): CartItem
      checkout(token: String!): Order
    }
  `,
  resolvers: {
    Mutation: {
      checkout: async (root: any, { token }: { token: string }, context: any) => {
        const { session } = context;
        // 1. Query the current user and make sure they are signed in
        const userId = session.itemId;
        if (!userId) throw new Error('You must be signed in to complete this order.');

        // FIXME: Use the new graphQL API when it's available
        const User = await getItem({
          context,
          listKey: 'User',
          itemId: userId,
          returnFields: `
            id
            name
            email
            cart {
              id
              quantity
              product { name price id description image { id publicUrlTransformed } }
            }`,
        });

        // 2. recalculate the total for the price
        const amount = User.cart.reduce(
          (tally: number, cartItem: any) => tally + cartItem.product.price * cartItem.quantity,
          0
        );
        console.log(`Going to charge for a total of ${amount}`);

        // 3. Create the Payment Intent, given the Payment Method ID
        // by passing confirm: true, We do stripe.paymentIntent.create() and stripe.paymentIntent.confirm() in 1 go.
        // FIXME: How do we test this? Is this going to charge someone's card?
        const charge = { id: 'MADE UP', amount, token };
        // const charge = await stripe.paymentIntents.create({
        //   amount,
        //   currency: 'USD',
        //   confirm: true,
        //   payment_method: token,
        // });

        // 4. Convert the CartItems to OrderItems
        const orderItems = User.cart.map((cartItem: any) => {
          const orderItem = {
            name: cartItem.product.name,
            description: cartItem.product.description,
            price: cartItem.product.price,
            quantity: cartItem.quantity,
            image: { connect: { id: cartItem.product.image.id } },
          };
          return orderItem;
        });

        // 5. create the Order
        console.log('Creating the order');
        const order = await context.lists.Order.createOne({
          data: {
            total: charge.amount,
            charge: `${charge.id}`,
            items: { create: orderItems },
            user: { connect: { id: userId } },
          },
        });
        // 6. Clean up - clear the users cart, delete cartItems
        const cartItemIds = User.cart.map((cartItem: any) => cartItem.id);
        await deleteItems({ context, listKey: 'CartItem', items: cartItemIds });

        // 7. Return the Order to the client
        return order;
      },
      addToCart: async (root: any, { productId }: { productId: string }, context: any) => {
        const { session } = context;
        // 1. Make sure they are signed in
        const userId = session.itemId;
        if (!userId) {
          throw new Error('You must be signed in soooon');
        }
        // 2. Query the users current cart, to see if they already have that item
        const allCartItems = await getItems({
          context,
          where: { user: { id: userId }, product: { id: productId } },
          listKey: 'CartItem',
          returnFields: 'id quantity',
        });

        // 3. Check if that item is already in their cart and increment by 1 if it is
        const [existingCartItem] = allCartItems;
        if (existingCartItem) {
          const { quantity } = existingCartItem;
          console.log(`There are already ${quantity} of these items in their cart`);
          return await context.lists.CartItem.updateOne({
            id: existingCartItem.id,
            data: { quantity: quantity + 1 },
          });
        } else {
          // 4. If its not, create a fresh CartItem for that user!
          return await context.lists.CartItem.createOne({
            data: {
              product: { connect: { id: productId } },
              user: { connect: { id: userId } },
            },
          });
        }
      },
    },
  },
});
