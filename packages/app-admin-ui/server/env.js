exports.mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

exports.enableDevFeatures =
  process.env.ENABLE_DEV_FEATURES === 'true'
    ? true
    : process.env.ENABLE_DEV_FEATURES === 'false'
    ? false
    : exports.mode !== 'production';
