import { resolveView } from '../../resolve-view';
import {
  SlugImplementation,
  MongoSlugInterface,
  KnexSlugInterface,
  PrismaSlugInterface,
} from './Implementation';

const Slug = {
  type: 'Slug',
  implementation: SlugImplementation,
  views: {
    Controller: resolveView('types/Text/views/Controller'),
    Field: resolveView('types/Text/views/Field'),
    Filter: resolveView('types/Text/views/Filter'),
  },
  adapters: {
    knex: KnexSlugInterface,
    mongoose: MongoSlugInterface,
    prisma: PrismaSlugInterface,
  },
};

export default Slug;
