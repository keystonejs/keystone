import { importView } from '@keystonejs/build-field-types';
import {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
} from '../Relationship/Implementation';
import { resolveBacklinks } from '../Relationship/backlinks';

export default {
  type: 'RelationshipList',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: importView('../Relationship/views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('../Relationship/views/Cell'),
  },
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
  },
  resolveBacklinks,
};
