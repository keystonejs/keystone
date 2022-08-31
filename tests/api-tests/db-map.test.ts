import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import globby from 'globby';
import { apiTestConfig, dbProvider, getPrismaSchema } from './utils';

test('db.map at the list level adds @@map with the value to the Prisma schema', async () => {
  const prismaSchema = await getPrismaSchema(
    apiTestConfig({
      lists: {
        SomeList: list({
          db: {
            map: 'some_table_name',
          },
          fields: {
            someField: text(),
          },
        }),
      },
    })
  );
  expect(prismaSchema)
    .toEqual(`// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${dbProvider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${dbProvider}"
}

generator client {
  provider = "prisma-client-js"
  output   = "node_modules/.prisma/client"
}

model SomeList {
  id        String @id @default(cuid())
  someField String @default("")

  @@map("some_table_name")
}
`);
});

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});

testModules
  .map(require)
  .filter(
    ({ supportsDbMap, unSupportedAdapterList = [] }) =>
      supportsDbMap && !unSupportedAdapterList.includes(process.env.TEST_ADAPTER)
  )
  .map(mod => {
    test(`db.map for the field ${mod.name} adds @map with the value to the Prisma schema`, async () => {
      const prismaSchema = await getPrismaSchema(
        apiTestConfig({
          lists: {
            SomeList: list({
              fields: {
                someField: mod.typeFunction({
                  ...mod.fieldConfig?.(),
                  db: {
                    map: 'db_map_field',
                  },
                }),
              },
            }),
          },
        })
      );
      expect(prismaSchema).toContain(' @map("db_map_field")');
    });
  });

// since we can only check whether the prisma schema contains the @map
// for all the fields since they all generate different prisma schemas
// this makes sure we generate it in the right place
test(`db.map for the field text field adds @map with the value to the Prisma schema`, async () => {
  const prismaSchema = await getPrismaSchema(
    apiTestConfig({
      lists: {
        SomeList: list({
          fields: {
            someField: text({
              db: {
                map: 'db_map_field',
              },
            }),
          },
        }),
      },
    })
  );
  expect(prismaSchema)
    .toEqual(`// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${dbProvider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${dbProvider}"
}

generator client {
  provider = "prisma-client-js"
  output   = "node_modules/.prisma/client"
}

model SomeList {
  id        String @id @default(cuid())
  someField String @default("") @map("db_map_field")
}
`);
});
