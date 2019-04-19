import {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
} from './Implementation';
import { resolveBacklinks } from './backlinks';
import { importView } from '@keystone-alpha/build-field-types';

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
  },
  resolveBacklinks,
};
