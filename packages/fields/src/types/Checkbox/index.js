import {
  Checkbox,
  MongoCheckboxInterface,
  KnexCheckboxInterface,
  PrismaCheckboxInterface,
} from './Implementation';

export default {
  type: 'Checkbox',
  implementation: Checkbox,
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
    prisma: PrismaCheckboxInterface,
  },
};
