import {
  Password,
  MongoPasswordInterface,
  KnexPasswordInterface,
  PrismaPasswordInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: resolveView('types/Password/views/Controller'),
    Field: resolveView('types/Password/views/Field'),
    Filter: resolveView('types/Password/views/Filter'),
    Cell: resolveView('types/Password/views/Cell'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
    prisma: PrismaPasswordInterface,
  },
};
