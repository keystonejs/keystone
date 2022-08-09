import { mergeSchemas } from '@graphql-tools/schema';
import type { GraphQLSchema } from 'graphql';
import addToCart from './addToCart';
import checkout from './checkout';

// make a fake graphql tagged template literal
const graphql = String.raw;

export const extendGraphqlSchema = (schema: GraphQLSchema) =>
  mergeSchemas({
    schemas: [schema],
    typeDefs: graphql`
      type Mutation {
        addToCart(productId: ID): CartItem
        checkout(token: String!): Order
      }
    `,
    resolvers: {
      Mutation: {
        addToCart,
        checkout,
      },
    },
  });
