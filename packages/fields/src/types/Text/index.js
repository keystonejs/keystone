import { Text, MongoTextInterface, KnexTextInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
