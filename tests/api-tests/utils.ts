import { KeystoneConfig, DatabaseProvider } from '@keystone-next/types';

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things, so we don't
// export it from the `@keystone-next/testing` package.
export const apiTestConfig: (config: Omit<KeystoneConfig, 'db'>) => KeystoneConfig = (
  config: Omit<KeystoneConfig, 'db'>
) => ({
  ...config,
  db: {
    provider: process.env.TEST_ADAPTER as DatabaseProvider,
    url: process.env.DATABASE_URL as string,
  },
});
