import { SlugImplementation, MongoSlugInterface, KnexSlugInterface, JSONSlugInterface, MemorySlugInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

const Slug = {
  type: 'Slug',
  implementation: SlugImplementation,
  views: {
    Controller: importView('../Text/views/Controller'),
    Field: importView('../Text/views/Field'),
    Filter: importView('../Text/views/Filter'),
  },
  adapters: {
    knex: KnexSlugInterface,
    mongoose: MongoSlugInterface,
    json: JSONSlugInterface,
    memory: MemorySlugInterface,
  },
};

export default Slug;
