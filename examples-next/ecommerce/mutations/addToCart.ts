import { KeystoneContext } from '@keystone-next/types';
import { Session } from '../types';

async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<any> {
  console.log('ADDING TO CART!');
  // 1. Query the current user see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this!');
  }
  // 2. Query the current users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    query: 'id quantity',
  });

  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(existingCartItem);
    console.log(`There are already ${existingCartItem.quantity}, increment by 1!`);
    // 3. See if the current item is in their cart
    // 4. if itis, increment by 1
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
      query: false,
    });
  }
  // 4. if it isnt, create a new cart item!
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
    query: false,
  });
}

export default addToCart;
