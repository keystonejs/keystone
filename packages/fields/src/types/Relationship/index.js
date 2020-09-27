import {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
  PrismaRelationshipInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: resolveView('types/Relationship/views/Controller'),
    Field: resolveView('types/Relationship/views/Field'),
    Filter: resolveView('types/Relationship/views/Filter'),
    Cell: resolveView('types/Relationship/views/Cell'),
  },
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
    prisma: PrismaRelationshipInterface,
  },
};
