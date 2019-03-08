module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          // See: https://browserl.ist/?q=%3E%3D+0.5%25%2C+not+ie+%3C%3D+11%2C+not+last+10000+OperaMini+versions%2C+not+last+10000+OperaMobile+versions%2C+not+dead%2C+node+10.9.0%2C+chrome+%3E%3D+59
          // NOTE: `chrome >= 59` so that Cypress < v4.0.0 will run our code (it
          // uses Chromium v59)
          // NOTE: We drop OperaMini & OperaMobile support because they're
          // basically useless.
          targets:
            '>= 0.5%, not ie <= 11, not last 10000 OperaMini versions, not last 10000 OperaMobile versions, not dead, node 10.9.0, chrome >= 59',
          // Seriously though; the regenerator makes my debugging life at least
          // 1000x harder :'(
          exclude: ['transform-regenerator', 'transform-async-to-generator'],
        },
        'transform-runtime': {
          regenerator: false,
        },
      },
    ],
    '@babel/flow',
  ],
  plugins: ['emotion'],
};
