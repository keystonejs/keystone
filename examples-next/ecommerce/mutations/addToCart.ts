import { getItems } from '@keystonejs/server-side-graphql-client';

export default async function addToCart(root: any, { productId }: { productId: string }, context: any) {
  const { session } = context;
  // 1. Make sure they are signed in
  const userId = session.itemId;
  if (!userId) {
    throw new Error('You must be signed in!');
  }
  // 2. Query the users current cart, to see if they already have that item
  console.dir(context.lists, { depth: null });
  return;
  // const allCartItems = context.lists.CartItem.

  // return;
  // const allCartItems = await getItems({
  //   context,
  //   where: { user: { id: userId }, product: { id: productId } },
  //   listKey: 'CartItem',
  //   returnFields: 'id quantity',
  // });

  // // 3. Check if that item is already in their cart and increment by 1 if it is
  // const [existingCartItem] = allCartItems;
  // if (existingCartItem) {
  //   const { quantity } = existingCartItem;
  //   console.log(`There are already ${quantity} of these items in their cart`);
  //   return await context.lists.CartItem.updateOne({
  //     id: existingCartItem.id,
  //     data: { quantity: quantity + 1 },
  //   });
  // } else {
  //   // 4. If its not, create a fresh CartItem for that user!
  //   return await context.lists.CartItem.createOne({
  //     data: {
  //       product: { connect: { id: productId } },
  //       user: { connect: { id: userId } },
  //     },
  //   });
  // }
}
