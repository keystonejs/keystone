import { initConfig, createSystem } from '@keystone-6/core/system';
import { getCommittedArtifacts } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts';
import { KeystoneConfig, KeystoneContext, DatabaseProvider } from '@keystone-6/core/types';
import { setupTestRunner } from './test-runner';

let prevConsoleWarn = console.warn;

console.warn = function (...args: unknown[]) {
  if (
    typeof args[0] === 'string' &&
    args[0].endsWith(
      // this is expected
      'There are already 10 instances of Prisma Client actively running.'
    )
  ) {
    return;
  }
  prevConsoleWarn.apply(this, args);
};

export const dbProvider: DatabaseProvider = (() => {
  let provider = process.env.TEST_ADAPTER;
  if (provider === undefined) {
    if (process.env.CI) {
      throw new Error('TEST_ADAPTER must be explicitly set in CI');
    }
    return 'sqlite';
  }
  if (provider === 'sqlite' || provider === 'postgresql' || provider === 'mysql') {
    return provider;
  }
  throw new Error(`Unexpected TEST_ADAPTER value: ${provider}`);
})();

// TODO: remove usages of TEST_ADAPTER
process.env.TEST_ADAPTER = dbProvider;

const workerId = process.env.JEST_WORKER_ID;

if (workerId === undefined) {
  throw new Error('expected JEST_WORKER_ID to be set');
}

export const SQLITE_DATABASE_FILENAME = `test.db`;

export const { dbUrl, dbName } = ((): { dbUrl: string; dbName: string } => {
  if (dbProvider === 'sqlite') {
    return { dbUrl: `file:./${SQLITE_DATABASE_FILENAME}`, dbName: SQLITE_DATABASE_FILENAME };
  }
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl === undefined) {
    throw new Error(`DATABASE_URL must be set when using TEST_ADAPTER=${dbProvider}`);
  }

  if (
    !(
      dbUrl.startsWith(`${dbProvider}://`) ||
      (dbProvider === 'postgresql' && dbUrl.startsWith('postgres://'))
    )
  ) {
    throw new Error(
      `DATABASE_URL must start with ${dbProvider}:// when using TEST_ADAPTER=${dbProvider}`
    );
  }

  // the URL constructor puts everything after the protocol for unknown protocols into the pathname which isn't what we want here
  const url = new URL(dbUrl.replace(/^(mysql|postgres(?:ql)?)/, 'http'));

  url.pathname += `-${workerId}`;

  return {
    dbUrl: url.toString().replace(/^http/, dbProvider),
    // the .slice(1) is because pathname includes the `/`
    dbName: url.pathname.slice(1),
  };
})();

export type APITestConfig = Omit<KeystoneConfig, 'db'> & {
  db?: Omit<KeystoneConfig['db'], 'provider' | 'url'>;
};

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things
export const apiTestConfig = (config: APITestConfig): KeystoneConfig => ({
  ...config,
  db: {
    ...config.db,
    provider: dbProvider,
    url: dbUrl,
  },
});

export type TypeInfoFromConfig<Config extends KeystoneConfig<any>> = Config extends KeystoneConfig<
  infer TypeInfo
>
  ? TypeInfo
  : never;

export type ContextFromConfig<Config extends KeystoneConfig<any>> = KeystoneContext<
  TypeInfoFromConfig<Config>
>;

export type ContextFromRunner<Runner extends ReturnType<typeof setupTestRunner>> = Parameters<
  Parameters<Runner>[0]
>[0]['context'];

export type ListKeyFromRunner<Runner extends ReturnType<typeof setupTestRunner>> =
  keyof ContextFromRunner<Runner>['db'];

export const unpackErrors = (errors: readonly any[] | undefined) =>
  (errors || []).map(({ locations, ...unpacked }) => unpacked);

function j(messages: string[]) {
  return messages.map(m => `  - ${m}`).join('\n');
}

export const expectInternalServerError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
      path,
      message,
    }))
  );
};

export function expectLimitsExceededError(
  errors: readonly any[] | undefined,
  args: { path: string[] }[]
) {
  expect(
    errors?.map(({ path, extensions, message }) => ({
      path,
      extensions,
      message,
    }))
  ).toEqual(
    args.map(({ path }) => ({
      path,
      extensions: { code: 'KS_LIMITS_EXCEEDED' },
      message: 'Your request exceeded server limits',
    }))
  );
}

export const expectGraphQLValidationError = (
  errors: readonly any[] | undefined,
  args: { message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ message }) => ({ extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }, message }))
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
    args.map(({ path, msg }) => ({
      extensions: { code: 'KS_ACCESS_DENIED' },
      path,
      message: `Access denied: ${msg}`,
    }))
  );
};

export const expectValidationError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; messages: string[] }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages }) => ({
      extensions: { code: 'KS_VALIDATION_FAILURE' },
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
      stacktrace[0] = `GraphQLError: ${stacktrace[0]}`;

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
          ...(expectException ? { stacktrace: expect.arrayContaining(stacktrace) } : {}),
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
  args: { path: (string | number)[]; message: string; code: string; target: string[] | string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message, code, target }) => ({
      extensions: {
        code: 'KS_PRISMA_ERROR',
        prisma: {
          clientVersion: require('@keystone-6/core/package.json').dependencies['prisma'],
          code,
          meta: { target },
        },
      },
      path,
      message,
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

export const expectAccessReturnError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; errors: { tag: string; returned: string }[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, errors }) => {
      const message = `Invalid values returned from access control function.\n${j(
        errors.map(e => `${e.tag}: Returned: ${e.returned}. Expected: boolean.`)
      )}`;
      return { extensions: { code: 'KS_ACCESS_RETURN_ERROR' }, path, message };
    })
  );
};

export const expectFilterDenied = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({ extensions: { code: 'KS_FILTER_DENIED' }, path, message }))
  );
};

export const expectResolverError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; messages: string[]; debug: any[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, debug }) => {
      const message = `An error occured while resolving input fields.\n${j(messages)}`;
      return { extensions: { code: 'KS_RESOLVER_ERROR', debug }, path, message };
    })
  );
};

export const expectSingleResolverError = (
  errors: readonly any[] | undefined,
  path: string,
  fieldPath: string,
  message: string
) =>
  expectResolverError(errors, [
    {
      path: [path],
      messages: [`${fieldPath}: ${message}`],
      debug: [{ message, stacktrace: expect.stringMatching(new RegExp(`Error: ${message}\n`)) }],
    },
  ]);

export const expectRelationshipError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; messages: string[]; debug: any[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, debug }) => {
      const message = `An error occured while resolving relationship fields.\n${j(messages)}`;
      return { extensions: { code: 'KS_RELATIONSHIP_ERROR', debug }, path, message };
    })
  );
};

export const expectSingleRelationshipError = (
  errors: readonly any[] | undefined,
  path: string,
  fieldPath: string,
  message: string
) =>
  expectRelationshipError(errors, [
    {
      path: [path],
      messages: [`${fieldPath}: ${message}`],
      debug: [{ message, stacktrace: expect.stringMatching(new RegExp(`Error: ${message}\n`)) }],
    },
  ]);

export async function seed<T extends Record<keyof T, Record<string, unknown>[]>>(
  context: KeystoneContext,
  initialData: T
) {
  const results: any = {};
  for (const listKey of Object.keys(initialData)) {
    results[listKey as keyof T] = await context.sudo().query[listKey].createMany({
      data: initialData[listKey as keyof T],
    });
  }

  return results as Record<keyof T, Record<string, unknown>[]>;
}

export const getPrismaSchema = async (_config: KeystoneConfig) => {
  const config = initConfig(_config);
  const { graphQLSchema } = createSystem(config);

  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  return artifacts.prisma;
};
