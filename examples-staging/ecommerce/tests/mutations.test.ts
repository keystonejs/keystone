import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import config from '../keystone';

const FAKE_ID = 'cinjfgbkjnfg';

const asUser = (context: KeystoneContext, itemId?: string) =>
  context.withSession({ itemId, data: {} });

const runner = setupTestRunner({ config });

describe(`Custom mutations`, () => {
  describe('checkout(token)', () => {
    const token = 'TOKEN'; // This is not currently used by the mutation
    const query = `mutation m($token: String!){ checkout(token: $token) {
            id
            label
            total
            items(orderBy: { name: asc }) { name description price quantity photo { id } }
            user { id }
            charge
          } }`;
    test(
      'Not logged in should throw',
      runner(async ({ context }) => {
        const _context = asUser(context, undefined);
        const { data, errors } = await _context.graphql.raw({
          query,
          variables: { token },
        });
        expect(data).toEqual({ checkout: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('Sorry! You must be signed in to create an order!');
      })
    );
    test(
      'A users cart should correctly convert into an order',
      runner(async ({ context }) => {
        const { Product, User } = context.sudo().lists;

        // Create some products: FIXME: createMany
        const product1 = await Product.createOne({
          data: {
            name: 'test product 1',
            description: 'TEST 1',
            status: 'AVAILABLE',
            price: 5,
            photo: { create: { altText: 'product 1' } },
          },
          query: 'id name description price photo { id }',
        });
        const product2 = await Product.createOne({
          data: {
            name: 'test product 2',
            description: 'TEST 2',
            status: 'AVAILABLE',
            price: 7,
            photo: { create: { altText: 'product 2' } },
          },
          query: 'id name description price photo { id }',
        });

        // Create some users
        const user1 = await User.createOne({
          data: { name: 'Test User 1', email: 'test1@example.com' },
        });
        const user2 = await User.createOne({
          data: { name: 'Test User 2', email: 'test2@example.com' },
        });

        // Add some products to some carts
        const q1 = asUser(context, user1.id).graphql.raw;
        const q =
          'mutation m($productId: ID!){ addToCart(productId: $productId) { id quantity product { id } user { id } } }';
        await q1({ query: q, variables: { productId: product1.id } });
        await q1({ query: q, variables: { productId: product2.id } });
        await q1({ query: q, variables: { productId: product1.id } });
        await q1({ query: q, variables: { productId: product2.id } });
        await q1({ query: q, variables: { productId: product1.id } });
        const q2 = asUser(context, user2.id).graphql.raw;
        await q2({ query: q, variables: { productId: product2.id } });
        await q2({ query: q, variables: { productId: product1.id } });
        await q2({ query: q, variables: { productId: product2.id } });
        await q2({ query: q, variables: { productId: product1.id } });
        await q2({ query: q, variables: { productId: product2.id } });

        // Checkout user 1
        const result1 = await asUser(context, user1.id).graphql.raw({
          query,
          variables: { token },
        });

        // Confirm that the checkout has worked
        expect(result1.errors).toBe(undefined);
        expect(result1.data!.checkout.charge).toEqual('MADE UP');
        expect(result1.data!.checkout.total).toEqual(3 * 5 + 2 * 7);
        expect(result1.data!.checkout.user.id).toEqual(user1.id);
        expect(result1.data!.checkout.items).toHaveLength(2);
        expect(result1.data!.checkout.items[0].name).toEqual(product1.name);
        expect(result1.data!.checkout.items[0].description).toEqual(product1.description);
        expect(result1.data!.checkout.items[0].price).toEqual(product1.price);
        expect(result1.data!.checkout.items[0].quantity).toEqual(3);
        expect(result1.data!.checkout.items[0].photo.id).toEqual(product1.photo.id);
        expect(result1.data!.checkout.items[1].name).toEqual(product2.name);
        expect(result1.data!.checkout.items[1].description).toEqual(product2.description);
        expect(result1.data!.checkout.items[1].price).toEqual(product2.price);
        expect(result1.data!.checkout.items[1].quantity).toEqual(2);
        expect(result1.data!.checkout.items[1].photo.id).toEqual(product2.photo.id);

        // Checkout user 2
        const result2 = await asUser(context, user2.id).graphql.raw({
          query,
          variables: { token },
        });

        // Confirm that the checkout has worked
        expect(result2.errors).toBe(undefined);
        expect(result2.data!.checkout.charge).toEqual('MADE UP');
        expect(result2.data!.checkout.total).toEqual(2 * 5 + 3 * 7);
        expect(result2.data!.checkout.user.id).toEqual(user2.id);
        expect(result2.data!.checkout.items).toHaveLength(2);
        expect(result2.data!.checkout.items[0].name).toEqual(product1.name);
        expect(result2.data!.checkout.items[0].description).toEqual(product1.description);
        expect(result2.data!.checkout.items[0].price).toEqual(product1.price);
        expect(result2.data!.checkout.items[0].quantity).toEqual(2);
        expect(result2.data!.checkout.items[0].photo.id).toEqual(product1.photo.id);
        expect(result2.data!.checkout.items[1].name).toEqual(product2.name);
        expect(result2.data!.checkout.items[1].description).toEqual(product2.description);
        expect(result2.data!.checkout.items[1].price).toEqual(product2.price);
        expect(result2.data!.checkout.items[1].quantity).toEqual(3);
        expect(result2.data!.checkout.items[1].photo.id).toEqual(product2.photo.id);
      })
    );
  });

  describe('addToCart(productId)', () => {
    const query =
      'mutation m($productId: ID!){ addToCart(productId: $productId) { id quantity product { id } user { id } } }';
    test(
      'Not logged in should throw',
      runner(async ({ context }) => {
        const { graphql } = asUser(context, undefined);
        const productId = FAKE_ID;
        const { data, errors } = await graphql.raw({ query, variables: { productId } });
        expect(data).toEqual({ addToCart: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('You must be logged in to do this!');
      })
    );

    test(
      'Adding a non-existant product should throw',
      runner(async ({ context }) => {
        const { graphql } = asUser(context, FAKE_ID);
        const productId = FAKE_ID;
        const { data, errors } = await graphql.raw({ query, variables: { productId } });
        expect(data).toEqual({ addToCart: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('Unable to connect a CartItem.product<Product>');
      })
    );

    test(
      'Adding a null product should throw',
      runner(async ({ context }) => {
        const { graphql } = asUser(context, FAKE_ID);
        const { data, errors } = await graphql.raw({
          // Note: $pid can be null as we need to check the behaviour of addToCart
          query: 'mutation m($pid: ID){ addToCart(productId: $pid) { id } }',
          variables: { pid: null },
        });
        expect(data).toEqual({ addToCart: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('Only a cuid can be passed to id filters');
      })
    );

    test(
      'Adding DRAFT product should throw',
      runner(async ({ context }) => {
        const { User, Product } = context.sudo().lists;
        // Setup user
        const user = await User.createOne({
          data: { name: 'Test User', email: 'test@example.com' },
        });

        // Setup product
        const product = await Product.createOne({
          data: { name: 'test product', status: 'DRAFT' },
        });

        // Add product to cart
        const { data, errors } = await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        expect(data).toEqual({ addToCart: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('Unable to connect a CartItem.product<Product>');
      })
    );

    test(
      'Adding UNAVAILABLE product should throw',
      runner(async ({ context }) => {
        const { User, Product } = context.sudo().lists;
        // Setup user
        const user = await User.createOne({
          data: { name: 'Test User', email: 'test@example.com' },
        });

        // Setup product
        const product = await Product.createOne({
          data: { name: 'test product', status: 'UNAVAILABLE' },
        });

        // Add product to cart
        const { data, errors } = await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        expect(data).toEqual({ addToCart: null });
        expect(errors).toHaveLength(1);
        expect(errors![0].message).toEqual('Unable to connect a CartItem.product<Product>');
      })
    );

    test(
      'Adding AVAILABLE product should return a cart item with a quantity of 1',
      runner(async ({ context }) => {
        const { User, Product } = context.sudo().lists;
        // Setup user
        const user = await User.createOne({
          data: { name: 'Test User', email: 'test@example.com' },
        });

        // Setup product
        const product = await Product.createOne({
          data: { name: 'test product', status: 'AVAILABLE' },
        });

        // Add product to cart
        const { data, errors } = await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        console.log(errors);
        expect(errors).toBe(undefined);
        expect(data!.addToCart.quantity).toEqual(1);
        expect(data!.addToCart.product.id).toEqual(product.id);
        expect(data!.addToCart.user.id).toEqual(user.id);
      })
    );

    test(
      'Adding a product multiple times should return a cart item with the correct quantity',
      runner(async ({ context }) => {
        const { User, Product } = context.sudo().lists;
        // Setup user
        const user = await User.createOne({
          data: { name: 'Test User', email: 'test@example.com' },
        });

        // Setup product
        const product = await Product.createOne({
          data: { name: 'test product', status: 'AVAILABLE' },
        });

        // Add product to cart
        await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        const { data, errors } = await asUser(context, user.id).graphql.raw({
          query,
          variables: { productId: product.id },
        });
        expect(errors).toBe(undefined);
        expect(data!.addToCart.quantity).toEqual(3);
        expect(data!.addToCart.product.id).toEqual(product.id);
        expect(data!.addToCart.user.id).toEqual(user.id);
      })
    );

    test(
      'Adding different products multiple times should return cart items with the correct quantity',
      runner(async ({ context }) => {
        const { User, Product } = context.sudo().lists;
        // Setup user
        const user = await User.createOne({
          data: { name: 'Test User', email: 'test@example.com' },
        });

        // Setup products
        const product1 = await Product.createOne({
          data: { name: 'test product 1', status: 'AVAILABLE' },
        });
        const product2 = await Product.createOne({
          data: { name: 'test product 2', status: 'AVAILABLE' },
        });

        // Add products to cart
        const q = asUser(context, user.id).graphql.raw;
        await q({ query, variables: { productId: product1.id } });
        await q({ query, variables: { productId: product2.id } });
        await q({ query, variables: { productId: product1.id } });
        await q({ query, variables: { productId: product2.id } });
        await q({ query, variables: { productId: product1.id } });
        const result1 = await context.sudo().lists.CartItem.findMany({
          where: { product: { id: { equals: product1.id } } },
          query: 'quantity',
        });
        expect(result1).toHaveLength(1);
        expect(result1[0].quantity).toEqual(3);
        const result2 = await context.sudo().lists.CartItem.findMany({
          where: { product: { id: { equals: product2.id } } },
          query: 'quantity',
        });
        expect(result2).toHaveLength(1);
        expect(result2[0].quantity).toEqual(2);
      })
    );
  });
});
