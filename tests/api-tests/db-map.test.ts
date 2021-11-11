import { list } from '@keystone-next/keystone';
import { getCommittedArtifacts } from '@keystone-next/keystone/artifacts';
import { text } from '@keystone-next/keystone/fields';
import { initConfig, createSystem } from '@keystone-next/keystone/system';
import { KeystoneConfig } from '@keystone-next/keystone/types';
import { apiTestConfig, dbProvider } from './utils';

const getPrismaSchema = async (_config: KeystoneConfig) => {
  const config = initConfig(_config);
  const { graphQLSchema } = createSystem(config);

  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  return artifacts.prisma;
};

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
  url      = env("DATABASE_URL")
  provider = "${dbProvider}"
}

generator client {
  provider   = "prisma-client-js"
  output     = "node_modules/.prisma/client"
  engineType = "binary"
}

model SomeList {
  id        String @id @default(cuid())
  someField String @default("")

  @@map("some_table_name")
}`);
});
