import { Text, MongoTextInterface, KnexTextInterface, PrismaTextInterface } from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: resolveView('types/Text/views/Controller'),
    Field: resolveView('types/Text/views/Field'),
    Filter: resolveView('types/Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    prisma: PrismaTextInterface,
  },
};
