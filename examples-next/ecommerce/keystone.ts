import 'dotenv/config';

import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-next/auth';
import { products } from './seedData';

/*
  TODO
    - [ ] Configure send forgotten password
    - [ ] Work out a good approach to seeding data
*/

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-examples-ecommerce';
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: process.env.COOKIE_SECRET || '',
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      permissions: 'ADMIN',
    },
  },
});

export default withAuth(
  config({
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      onConnect: async keystone => {
        console.log('Connected??', process.env.DATABASE_URL);

        if (process.argv.includes('--dummy')) {
          console.log('--------INSERTING DUMMY DATA ------------');
          const { mongoose } = keystone.adapters.MongooseAdapter;
          for (const product of products) {
            const { _id } = await mongoose
              .model('ProductImage')
              .create({ image: product.image, altText: product.description });
            product.image = _id;
            await mongoose.model('Product').create(product);
          }
          console.log('----- DUMMY DATA ADDED! Please start the process with `npm run dev` ------');
          process.exit();
        }
      },
    },
    lists,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: 'name permissions',
    }),
  })
);
