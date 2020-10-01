import { File, MongoFileInterface, KnexFileInterface, PrismaFileInterface } from './Implementation';
import { resolveView } from '../../resolve-view';

export default {
  type: 'File',
  implementation: File,
  views: {
    Controller: resolveView('types/File/views/Controller'),
    Field: resolveView('types/File/views/Field'),
    Cell: resolveView('types/File/views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
    prisma: PrismaFileInterface,
  },
};
