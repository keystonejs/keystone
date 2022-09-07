import { Server } from 'http';
import express from 'express';
import { TestArgs } from '@keystone-6/api-tests/test-runner';
import { createExpressServer } from '@keystone-6/core/system';
import supertest, { Test } from 'supertest';

export type GraphQLRequest = (arg: {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => Test;

type TestArgsWithServer = TestArgs & {
  graphQLRequest: GraphQLRequest;
  app: express.Express;
  server: Server;
};

async function getTestArgsWithServer(testArgs: TestArgs): Promise<{
  disconnect: () => Promise<void>;
  args: TestArgsWithServer;
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

export function withServer(
  runner: (testFn: (testArgs: TestArgs) => Promise<void>) => () => Promise<void>
) {
  return (testFn: (testArgs: TestArgsWithServer) => Promise<void>) => () => {
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
