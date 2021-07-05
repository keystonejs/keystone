import { KeystoneConfig, DatabaseProvider } from '@keystone-next/keystone/types';

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things, so we don't
// export it from `@keystone-next/keystone/testing`.
export const apiTestConfig = (
  config: Omit<KeystoneConfig, 'db'> & {
    db?: Omit<KeystoneConfig['db'], 'provider' | 'url'>;
  }
): KeystoneConfig => ({
  ...config,
  db: {
    ...config.db,
    provider: process.env.TEST_ADAPTER as DatabaseProvider,
    url: process.env.DATABASE_URL as string,
  },
});

const unpackErrors = (errors: readonly any[] | undefined) =>
  (errors || []).map(({ locations, ...unpacked }) => unpacked);

const j = (messages: string[]) => messages.map(m => `  - ${m}`).join('\n');

// FIXME: It's not clear to me right now why sometimes
// we get an expcetion, and other times we don't - TL
export const expectInternalServerError = (
  errors: readonly any[] | undefined,
  expectException: boolean,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        ...(expectException ? { exception: { locations: [expect.any(Object)], message } } : {}),
      },
      path,
      message,
    }))
  );
};

export const expectGraphQLValidationError = (
  errors: readonly any[] | undefined,
  args: { message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ message }) => ({
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      message,
    }))
  );
};

export const expectAccessDenied = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; msg: string }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  expect(unpackedErrors).toEqual(
    args.map(({ path }) => ({
      extensions: {
        code: httpQuery ? 'KS_ACCESS_DENIED' : undefined,
        ...(expectException
          ? { exception: { stacktrace: expect.arrayContaining([`Error: ${message}`]) } }
          : {}),
      },
      path,
      message: `Access denied: ${msg}`,
    }))
  );
};

export const expectValidationError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; messages: string[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages }) => ({
      extensions: { code: 'KS_VALIDATION_ERROR' },
      path,
      message: `You provided invalid data for this operation.\n${j(messages)}`,
    }))
  );
};

export const expectExtensionError = (
  mode: 'dev' | 'production',
  httpQuery: boolean,
  _debug: boolean | undefined,
  errors: readonly any[] | undefined,
  extensionName: string,
  args: { path: (string | number)[]; messages: string[]; debug: any[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, debug }) => {
      const message = `An error occured while running "${extensionName}".\n${j(messages)}`;
      const stacktrace = message.split('\n');
      stacktrace[0] = `Error: ${stacktrace[0]}`;

      // We expect to see debug details if:
      //   - httpQuery is false
      //   - graphql.debug is true or
      //   - graphql.debug is undefined and mode !== production or
      const expectDebug =
        _debug === true || (_debug === undefined && mode !== 'production') || !httpQuery;
      // We expect to see the Apollo exception under the same conditions, but only if
      // httpQuery is also true.
      const expectException = httpQuery && expectDebug;

      return {
        extensions: {
          code: 'KS_EXTENSION_ERROR',
          ...(expectException
            ? { exception: { stacktrace: expect.arrayContaining(stacktrace) } }
            : {}),
          ...(expectDebug ? { debug } : {}),
        },
        path,
        message,
      };
    })
  );
};

export const expectPrismaError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string; code: string; target: string[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message, code, target }) => ({
      extensions: {
        code: 'KS_PRISMA_ERROR',
        exception: { prisma: { clientVersion: '2.30.2', code, meta: { target } } },
        prisma: { clientVersion: '2.30.2', code, meta: { target } },
      },
      path,
      message,
    }))
  );
};

export const expectLimitsExceededError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; listKey: string; type: 'maxResults' | 'maxTotalResults'; limit: number }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, listKey, type, limit }) => ({
      extensions: { code: 'KS_LIMITS_EXCEEDED_ERROR' },
      path,
      message: `Your request exceeded server limits. '${listKey}' has ${type} limit of ${limit}`,
    }))
  );
};

export const expectBadUserInput = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: { code: 'KS_USER_INPUT_ERROR' },
      path,
      message: `Input error: ${message}`,
    }))
  );
};

export const expectSystemError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; messages: string[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages }) => ({
      extensions: { code: 'KS_SYSTEM_ERROR' },
      path,
      message: `System error:\n${j(messages)}`,
    }))
  );
};

export const expectRelationshipError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; messages: string[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages }) => ({
      extensions: { code: 'KS_RELATIONSHIP_ERROR' },
      path,
      message: `Relationship error:\n${j(messages)}`,
    }))
  );
};
