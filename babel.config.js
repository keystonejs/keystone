module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 10,
          browsers: [
            'last 2 chrome versions',
            'last 2 firefox versions',
            'last 2 safari versions',
            'last 2 edge versions',
          ],
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
  ],
  overrides: [
    {
      include: 'packages/fields/src/Controller.js',
      presets: ['@babel/preset-env'],
    },
  ],
};
