import { File, MongoFileInterface, KnexFileInterface, PrismaFileInterface } from './Implementation';

export default {
  type: 'File',
  implementation: File,
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
    prisma: PrismaFileInterface,
  },
};
