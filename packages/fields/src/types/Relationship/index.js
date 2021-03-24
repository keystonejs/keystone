import {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
  PrismaRelationshipInterface,
} from './Implementation';

export default {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
    prisma: PrismaRelationshipInterface,
  },
};
