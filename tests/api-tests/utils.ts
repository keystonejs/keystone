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
  (errors || []).map(({ locations, extensions: { exception, ...extensions }, ...unpacked }) => ({
    extensions,
    ...unpacked,
  }));

const j = (messages: string[]) => messages.map(m => `  - ${m}`).join('\n');

export const expectInternalServerError = (
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

export const expectPrismaError = (
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
