import { Relationship } from '@keystone-next/fields-legacy';
import { AuthedRelationship as implementation } from './Implementation';

export const AuthedRelationship = {
  ...Relationship,
  type: 'AuthedRelationship',
  implementation,
};
