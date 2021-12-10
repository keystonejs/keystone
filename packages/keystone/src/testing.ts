import path from 'path';
import crypto from 'crypto';
import fs from 'fs-extra';
import express from 'express';
import supertest, { Test } from 'supertest';
import memoizeOne from 'memoize-one';
import { getGenerator } from '@prisma/sdk';
import { ApolloServer } from 'apollo-server-express';
import type { KeystoneConfig, KeystoneContext } from './types';
import { requirePrismaClient, getSchemaPaths } from './artifacts';
import { pushPrismaSchemaToDatabase } from './migrations';
import { initConfig, createSystem, createExpressServer } from './system';
import { printPrismaSchema } from './lib/core/prisma-schema';
import { initialiseLists } from './lib/core/types-for-lists';

export type GraphQLRequest = (arg: {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => Test;

export type TestArgs = {
  context: KeystoneContext;
  graphQLRequest: GraphQLRequest;
  app: express.Express;
};

export type TestEnv = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs;
};

const _hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);
const _alreadyGeneratedProjects = new Set<string>();
export async function setupTestEnv({
  config: _config,
}: {
  config: KeystoneConfig;
}): Promise<TestEnv> {
  // Force the UI to always be disabled.
  const config = initConfig({ ..._config, ui: { ..._config.ui, isDisabled: true } });
  const { graphQLSchema, getKeystone } = createSystem(config);
  const prismaSchema = printPrismaSchema(
    initialiseLists(config),
    config.db.provider,
    config.db.prismaPreviewFeatures
  );
  const hash = _hashPrismaSchema(prismaSchema);

  const artifactPath = path.resolve('.keystone', 'tests', hash);

  if (!_alreadyGeneratedProjects.has(hash)) {
    _alreadyGeneratedProjects.add(hash);
    fs.mkdirSync(artifactPath, { recursive: true });
    const schemaPath = getSchemaPaths(artifactPath).prisma;
    await fs.writeFile(schemaPath, prismaSchema);
    const generator = await getGenerator({ schemaPath });
    await generator.generate();
    generator.stop();
  }
  await pushPrismaSchemaToDatabase(
    config.db.url,
    prismaSchema,
    path.join(artifactPath, 'schema.prisma'),
    true // shouldDropDatabase
  );

  const { connect, disconnect, createContext } = getKeystone(requirePrismaClient(artifactPath));
  type Servers = {
    apolloServer: ApolloServer;
    expressServer: express.Express;
    // to make TS not complain when checking .then to see if we have a promise or not
    then?: undefined;
  };
  let servers: Servers | Promise<Servers> | undefined;

  const app = express();

  app.use((req, res) => {
    if (servers === undefined) {
      // we don't just want to await it here because multiple requests could come in while the express server is initialising
      // so we store the promise
      servers = createExpressServer(config, graphQLSchema, createContext).then(x => {
        servers = x;
        return x;
      });
    }

    if (typeof servers.then === 'function') {
      servers.then(({ expressServer }) => {
        expressServer(req, res);
      });
    }
    if (servers.then === undefined) {
      servers.expressServer(req, res);
    }
  });

  const graphQLRequest: GraphQLRequest = ({ query, variables = undefined, operationName }) =>
    supertest(app)
      .post(config.graphql?.path || '/api/graphql')
      .send({ query, variables, operationName })
      .set('Accept', 'application/json');

  return {
    connect,
    disconnect: async () => {
      await Promise.all([disconnect(), (await servers)?.apolloServer.stop()]);
    },
    testArgs: { context: createContext(), graphQLRequest, app },
  };
}

export function setupTestRunner({ config }: { config: KeystoneConfig }) {
  return (testFn: (testArgs: TestArgs) => Promise<void>) => async () => {
    // Reset the database to be empty for every test.
    const { connect, disconnect, testArgs } = await setupTestEnv({ config });
    await connect();
    try {
      return await testFn(testArgs);
    } finally {
      await disconnect();
    }
  };
}
