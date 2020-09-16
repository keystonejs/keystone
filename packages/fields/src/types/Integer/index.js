import { Integer, MongoIntegerInterface, KnexIntegerInterface } from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: resolveView('types/Integer/views/Controller'),
    Field: resolveView('types/Integer/views/Field'),
    Filter: resolveView('types/Integer/views/Filter'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
