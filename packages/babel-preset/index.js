module.exports = () => {
  return {
    presets: [
      ['env', { exclude: ['transform-regenerator', 'transform-async-to-generator'] }],
      'react',
      'flow',
    ],
    plugins: [
      'transform-class-properties',
      'transform-object-rest-spread',
      [
        'emotion',
        process.env.NODE_ENV === 'production'
          ? { hoist: true }
          : { sourceMap: true, autoLabel: true },
      ],
    ],
  };
};
