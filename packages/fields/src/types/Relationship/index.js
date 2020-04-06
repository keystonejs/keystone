import {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
  // JSONRelationshipInterface,
  // MemoryRelationshipInterface,
} from './Implementation';
import { resolveBacklinks } from './backlinks';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
    // TODO: Support JSON/Memory
    json: MongoRelationshipInterface, // JSONRelationshipInterface,
    memory: MongoRelationshipInterface, // MemoryRelationshipInterface,
  },
  resolveBacklinks,
};
