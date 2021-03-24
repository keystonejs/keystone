import {
  SlugImplementation,
  MongoSlugInterface,
  KnexSlugInterface,
  PrismaSlugInterface,
} from './Implementation';

const Slug = {
  type: 'Slug',
  implementation: SlugImplementation,
  adapters: {
    knex: KnexSlugInterface,
    mongoose: MongoSlugInterface,
    prisma: PrismaSlugInterface,
  },
};

export default Slug;
