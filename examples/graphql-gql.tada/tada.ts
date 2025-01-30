import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './tada.generated';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: string;
  }
}>();
