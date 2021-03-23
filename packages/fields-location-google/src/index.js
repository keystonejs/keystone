import {
  LocationGoogleImplementation,
  MongoLocationGoogleInterface,
  KnexLocationGoogleInterface,
  PrismaLocationGoogleInterface,
} from './Implementation';

export const LocationGoogle = {
  type: 'LocationGoogle',
  implementation: LocationGoogleImplementation,
  adapters: {
    mongoose: MongoLocationGoogleInterface,
    knex: KnexLocationGoogleInterface,
    prisma: PrismaLocationGoogleInterface,
  },
};
