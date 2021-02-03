import {
  Float,
  MongoFloatInterface,
  KnexFloatInterface,
  PrismaFloatInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: resolveView('types/Float/views/Controller'),
    Field: resolveView('types/Float/views/Field'),
    Filter: resolveView('types/Float/views/Filter'),
  },
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
    prisma: PrismaFloatInterface,
  },
};
