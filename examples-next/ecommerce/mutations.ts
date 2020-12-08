import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Mutation {
      addToCart(productId: ID): CartItem
      checkout(token: String!): Order
    }
  `,
  resolvers: {
    Mutation: {
      checkout: async (root, { token }: { token: string }, context) => {
        const { session } = context;

        // Users can't create orders directly because of our access control, so here we create a
        // new context with full access and use the items API it provides
        const sudoContext = context.createContext({ skipAccessControl: true });

        // 1. Query the current user and make sure they are signed in
        const userId = session.itemId;
        if (!userId) throw new Error('You must be signed in to complete this order.');

        const User = await sudoContext.lists.User.findOne({
          where: { id: userId },
          resolveFields: `
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
            user: { connect: { id: userId } },
          };
          return orderItem;
        });

        // 5. create the Order
        console.log('Creating the order');
        const order = await sudoContext.lists.Order.createOne({
          data: {
            total: charge.amount,
            charge: `${charge.id}`,
            items: { create: orderItems },
            user: { connect: { id: userId } },
          },
          resolveFields: false,
        });
        // 6. Clean up - clear the users cart, delete cartItems
        const cartItemIds = User.cart.map((cartItem: any) => cartItem.id);
        await sudoContext.lists.CartItem.deleteMany({ ids: cartItemIds });

        // 7. Return the Order to the client
        return order;
      },
      addToCart: async (root, { productId }: { productId: string }, context) => {
        const { session } = context;
        // 1. Make sure they are signed in
        const userId = session.itemId;
        if (!userId) {
          throw new Error('You must be signed in soooon');
        }
        // 2. Query the users current cart, to see if they already have that item
        const allCartItems = await context.lists.CartItem.findMany({
          where: { user: { id: userId }, product: { id: productId } },
          resolveFields: 'id quantity',
        });

        // 3. Check if that item is already in their cart and increment by 1 if it is
        const [existingCartItem] = allCartItems;
        if (existingCartItem) {
          const { quantity } = existingCartItem;
          console.log(`There are already ${quantity} of these items in their cart`);
          return await context.lists.CartItem.updateOne({
            id: existingCartItem.id,
            data: { quantity: quantity + 1 },
            resolveFields: false,
          });
        } else {
          // 4. If its not, create a fresh CartItem for that user!
          return await context.lists.CartItem.createOne({
            data: {
              product: { connect: { id: productId } },
              user: { connect: { id: userId } },
            },
            resolveFields: false,
          });
        }
      },
    },
  },
});
