import { Decimal, MongoDecimalInterface, KnexDecimalInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
  },
};
