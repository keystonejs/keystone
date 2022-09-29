import { Server } from 'http';
import express from 'express';
import { TestArgs } from '@keystone-6/api-tests/test-runner';
import { createExpressServer } from '@keystone-6/core/system';
import supertest, { Test } from 'supertest';
import { BaseKeystoneTypeInfo } from '@keystone-6/core/types';

export type GraphQLRequest = (arg: {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => Test;

type TestArgsWithServer<TypeInfo extends BaseKeystoneTypeInfo> = TestArgs<TypeInfo> & {
  graphQLRequest: GraphQLRequest;
  app: express.Express;
  server: Server;
};

async function getTestArgsWithServer<TypeInfo extends BaseKeystoneTypeInfo>(
  testArgs: TestArgs<TypeInfo>
): Promise<{
  disconnect: () => Promise<void>;
  args: TestArgsWithServer<TypeInfo>;
}> {
  const {
    expressServer: app,
    apolloServer,
    httpServer: server,
  } = await createExpressServer(
    testArgs.config,
    testArgs.context.graphql.schema,
    testArgs.createContext
  );

  const graphQLRequest: GraphQLRequest = ({ query, variables = undefined, operationName }) =>
    supertest(app)
      .post(testArgs.config.graphql?.path || '/api/graphql')
      .send({ query, variables, operationName })
      .set('Accept', 'application/json');

  return {
    disconnect: () => apolloServer.stop(),
    args: {
      ...testArgs,
      app,
      graphQLRequest,
      server,
    },
  };
}

export function withServer<TypeInfo extends BaseKeystoneTypeInfo>(
  runner: (testFn: (testArgs: TestArgs<TypeInfo>) => Promise<void>) => () => Promise<void>
) {
  return (testFn: (testArgs: TestArgsWithServer<TypeInfo>) => Promise<void>) => () => {
    return runner(async baseTestArgs => {
      const { disconnect, args } = await getTestArgsWithServer(baseTestArgs);
      try {
        await testFn(args);
      } finally {
        await disconnect();
      }
    })();
  };
}
