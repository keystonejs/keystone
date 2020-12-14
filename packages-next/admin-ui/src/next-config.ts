// @ts-ignore
import withPreconstruct from '@preconstruct/next';
import Path from 'path';

export const config = withPreconstruct({
  webpack(config: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: Path.dirname(require.resolve('react/package.json')),
      'react-dom': Path.dirname(require.resolve('react-dom/package.json')),
      '@keystone-next/admin-ui': Path.dirname(
        require.resolve('@keystone-next/admin-ui/package.json')
      ),
    };
    return config;
  },
});
