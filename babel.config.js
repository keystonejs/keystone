module.exports = {
  presets: [
    ['@babel/env', { exclude: ['transform-regenerator', 'transform-async-to-generator'] }],
    '@babel/react',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
  ],
};
