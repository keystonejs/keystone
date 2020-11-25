export default async function addToCart(root: any, { productId }: { productId: string }, context: any) {
  const { session } = context;
  console.log('adding to cart...');
  // 1. Make sure they are signed in
  const userId = session.itemId;
  if (!userId) {
    throw new Error('You must be signed in!');
  }
  // 2. Query the users current cart, to see if they already have that item
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: userId }, product: { id: productId } }
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
}
