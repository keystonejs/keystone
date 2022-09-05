import { initConfig, createSystem } from '@keystone-6/core/system';
import { getCommittedArtifacts } from '@keystone-6/core/artifacts';
import { KeystoneConfig, KeystoneContext, DatabaseProvider } from '@keystone-6/core/types';

let prevConsoleWarn = console.warn;

console.warn = function (...args: unknown[]) {
  if (
    typeof args[0] === 'string' &&
    (args[0].endsWith(
      // this is expected
      'There are already 10 instances of Prisma Client actively running.'
    ) ||
      // we should really enforce a safe default for this though
      args[0] ===
        'Persisted queries are enabled and are using an unbounded cache. Your server is vulnerable to denial of service attacks via memory exhaustion. Set `cache: "bounded"` or `persistedQueries: false` in your ApolloServer constructor, or see https://go.apollo.dev/s/cache-backends for other alternatives.')
  ) {
    return;
  }
  prevConsoleWarn.apply(this, args);
};

export const dbProvider = process.env.TEST_ADAPTER as DatabaseProvider;

export const apiTestConfig = (
  config: Omit<KeystoneConfig, 'db'> & {
    db?: Omit<KeystoneConfig['db'], 'provider' | 'url'>;
  }
): KeystoneConfig => ({
  ...config,
  db: {
    ...config.db,
    provider: dbProvider,
    url: process.env.DATABASE_URL as string,
  },
});

export const unpackErrors = (errors: readonly any[] | undefined) =>
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

export const expectLimitsExceededError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[] }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  const message = 'Your request exceeded server limits';
  expect(unpackedErrors).toEqual(
    args.map(({ path }) => ({ extensions: { code: 'KS_LIMITS_EXCEEDED' }, path, message }))
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
