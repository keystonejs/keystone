import { Relationship, PrismaRelationshipInterface } from './Implementation';

export default {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  adapters: {
    prisma: PrismaRelationshipInterface,
  },
};
