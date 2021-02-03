import {
  DateTimeUtcImplementation,
  MongoDateTimeUtcInterface,
  KnexDateTimeUtcInterface,
  PrismaDateTimeUtcInterface,
} from './Implementation';
import DateTime from '../DateTime';

export default {
  type: 'DateTimeUtc',
  implementation: DateTimeUtcImplementation,
  views: {
    Controller: DateTime.views.Controller,
    Field: DateTime.views.Field,
    Filter: DateTime.views.Filter,
    Cell: DateTime.views.Cell,
  },
  adapters: {
    mongoose: MongoDateTimeUtcInterface,
    knex: KnexDateTimeUtcInterface,
    prisma: PrismaDateTimeUtcInterface,
  },
};
