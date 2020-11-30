import { BaseKeystone } from '@keystone-next/types';

/*
  getDatabaseAPIs is used to provide access to the underlying database abstraction through
  context and other developer-facing APIs in Keystone, so they can be used easily.

  The implementation is very basic, and assumes there's a single adapter keyed by the constructor
  name. Since there's no option _not_ to do that using the new config, we probably don't need
  anything more sophisticated than this.
*/

export function getDatabaseAPIs(keystone: BaseKeystone) {
  return {
    knex: keystone.adapters.KnexAdapter?.knex,
    mongoose: keystone.adapters.MongooseAdapter?.mongoose,
    prisma: keystone.adapters.PrismaAdapter?.prisma,
  };
}
