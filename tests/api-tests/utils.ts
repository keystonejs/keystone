import { KeystoneConfig, DatabaseProvider } from '@keystone-next/types';

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things, so we don't
// export it from the `@keystone-next/testing` package.
export const apiTestConfig = (
  config: Omit<KeystoneConfig, 'db'> & {
    db?: Omit<KeystoneConfig['db'], 'provider' | 'url' | 'adapter'>;
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
  args: { path: (string | number)[] }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  expect(unpackedErrors).toEqual(
    args.map(({ path }) => ({
      extensions: { code: undefined },
      path,
      message: 'You do not have access to this resource',
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
      extensions: { code: undefined },
      path,
      message: `You provided invalid data for this operation.\n${j(messages)}`,
    }))
  );
};

export const expectExtensionError = (
  mode: 'dev' | 'production',
  httpQuery: boolean,
  errors: readonly any[] | undefined,
  extensionName: string,
  args: { path: (string | number)[]; messages: string[]; errors: any[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, errors }) => {
      const message = `An error occured while running "${extensionName}".\n${j(messages)}`;
      const stacktrace = message.split('\n');
      stacktrace[0] = `Error: ${stacktrace[0]}`;
      return {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          ...(httpQuery && mode !== 'production'
            ? { exception: { errors, stacktrace: expect.arrayContaining(stacktrace) } }
            : {}),
          ...(mode !== 'production' ? { errors } : {}),
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
        code: 'INTERNAL_SERVER_ERROR',
        exception: { clientVersion: '2.28.0', code, meta: { target } },
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
  expect(unpackedErrors).toEqual(
    args.map(({ path }) => ({
      extensions: { code: undefined },
      path,
      message: 'Your request exceeded server limits',
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
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
      path,
      message,
    }))
  );
};

export const expectRelationshipError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; message: string }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  expect(unpackedErrors).toEqual(args.map(({ path, message }) => ({ path, message })));
};
