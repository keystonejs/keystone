module.exports = {
  presets: [
    ['@babel/env', { exclude: ['transform-regenerator', 'transform-async-to-generator'] }],
    '@babel/react',
  ],
  plugins: ['@babel/plugin-proposal-class-properties', '@babel/proposal-object-rest-spread'],
};
