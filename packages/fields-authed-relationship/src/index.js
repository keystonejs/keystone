import { Relationship } from '@keystonejs/fields';
import { AuthedRelationship as implementation } from './Implementation';

export const AuthedRelationship = {
  ...Relationship,
  type: 'AuthedRelationship',
  implementation,
};
