import {
  Text,
  MongoTextInterface,
  KnexTextInterface,
  PrismaTextInterface,
} from '../Text/Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: resolveView('types/Text/views/Controller'),
    Field: resolveView('types/Url/views/Field'),
    Filter: resolveView('types/Text/views/Filter'),
    Cell: resolveView('types/Url/views/Cell'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    prisma: PrismaTextInterface,
  },
};
