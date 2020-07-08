import { resolveView } from '../../resolve-view';
import {
  Checkbox,
  MongoCheckboxInterface,
  KnexCheckboxInterface,
  PrismaCheckboxInterface,
} from './Implementation';

export default {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: resolveView('types/Checkbox/views/Controller'),
    Field: resolveView('types/Checkbox/views/Field'),
    Filter: resolveView('types/Checkbox/views/Filter'),
    Cell: resolveView('types/Checkbox/views/Cell'),
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
    prisma: PrismaCheckboxInterface,
  },
};
