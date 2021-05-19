import Path from 'path';
// @ts-ignore
import withPreconstruct from '@preconstruct/next';

export const config = withPreconstruct({
  webpack(config: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: Path.dirname(require.resolve('react/package.json')),
      'react-dom': Path.dirname(require.resolve('react-dom/package.json')),
      '@keystone-next/keystone': Path.dirname(
        require.resolve('@keystone-next/keystone/package.json')
      ),
    };
    config.externals = [...config.externals, /prisma[\/\\]generated-client/];
    return config;
  },
});
