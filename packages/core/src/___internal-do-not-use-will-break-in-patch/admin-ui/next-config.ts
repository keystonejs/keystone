import Path from 'path';
// @ts-ignore
import withPreconstruct from '@preconstruct/next';

export const config = withPreconstruct({
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config: any, { isServer }: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: Path.dirname(require.resolve('react/package.json')),
      'react-dom': Path.dirname(require.resolve('react-dom/package.json')),
      '@keystone-6/core': Path.dirname(require.resolve('@keystone-6/core/package.json')),
    };
    if (isServer) {
      config.externals = [
        ...config.externals,
        /@keystone-6\/core(?!\/___internal-do-not-use-will-break-in-patch\/admin-ui\/id-field-view|\/fields\/types\/[^\/]+\/views)/,
      ];
      // we need to set these to true so that when __dirname/__filename is used
      // to resolve the location of field views, we will get a path that we can use
      // rather than just the __dirname/__filename of the generated file.
      // https://webpack.js.org/configuration/node/#node__filename
      config.node ??= {};
      config.node.__dirname = true;
      config.node.__filename = true;
    }
    return config;
  },
});
