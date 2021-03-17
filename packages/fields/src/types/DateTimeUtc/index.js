import DateTime from '../DateTime';
import {
  DateTimeUtcImplementation,
  MongoDateTimeUtcInterface,
  KnexDateTimeUtcInterface,
  PrismaDateTimeUtcInterface,
} from './Implementation';

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
