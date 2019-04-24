module.exports = {
  presets: [
    [
      '@babel/env',
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
    '@babel/react',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    ...(process.env.NODE_ENV === 'test'
      ? [require('./packages/build-field-types').devBabelPlugin]
      : []),
  ],
};
