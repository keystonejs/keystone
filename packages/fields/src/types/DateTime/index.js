import {
  DateTime,
  MongoDateTimeInterface,
  KnexDateTimeInterface,
  PrismaDateTimeInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: resolveView('types/DateTime/views/Controller'),
    Field: resolveView('types/DateTime/views/Field'),
    Filter: resolveView('types/DateTime/views/Filter'),
    Cell: resolveView('types/DateTime/views/Cell'),
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
    prisma: PrismaDateTimeInterface,
  },
};
