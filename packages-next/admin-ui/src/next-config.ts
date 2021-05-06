import Path from 'path';
// @ts-ignore
import withPreconstruct from '@preconstruct/next';

export const config = withPreconstruct({
  webpack(config: any, { isServer }: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: Path.dirname(require.resolve('react/package.json')),
      'react-dom': Path.dirname(require.resolve('react-dom/package.json')),
      '@keystone-next/admin-ui': Path.dirname(
        require.resolve('@keystone-next/admin-ui/package.json')
      ),
    };
    if (isServer) {
      config.externals = [
        ...config.externals,
        /@keystone-next\/keystone/,
        // ughhh
        /@keystone-next\/types/,
        /prisma[\/\\]generated-client/,
      ];
    }
    return config;
  },
});
