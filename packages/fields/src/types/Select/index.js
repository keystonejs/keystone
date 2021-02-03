import {
  Select,
  MongoSelectInterface,
  KnexSelectInterface,
  PrismaSelectInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: resolveView('types/Select/views/Controller'),
    Field: resolveView('types/Select/views/Field'),
    Filter: resolveView('types/Select/views/Filter'),
    Cell: resolveView('types/Select/views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
    prisma: PrismaSelectInterface,
  },
};
