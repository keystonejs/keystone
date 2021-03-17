import { resolveView } from '../../resolve-view';
import {
  Virtual,
  MongoVirtualInterface,
  KnexVirtualInterface,
  PrismaVirtualInterface,
} from './Implementation';

export default {
  type: 'Virtual',
  implementation: Virtual,
  views: {
    Controller: resolveView('types/Virtual/views/Controller'),
    Cell: resolveView('types/Virtual/views/Cell'),
    Field: resolveView('types/Virtual/views/Field'),
    Filter: resolveView('types/Virtual/views/Filter'),
  },
  adapters: {
    mongoose: MongoVirtualInterface,
    knex: KnexVirtualInterface,
    prisma: PrismaVirtualInterface,
  },
};
