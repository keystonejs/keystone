import { importView } from '@keystonejs/build-field-types';
import { MongoTextInterface, KnexTextInterface } from '../Text/Implementation';
import { Email } from './Implementation';

export default {
  type: 'Email',
  implementation: Email,
  views: {
    Controller: importView('../Text/views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
