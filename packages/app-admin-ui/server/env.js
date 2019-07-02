exports.mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

exports.enableDevFeatures =
  process.env.ENABLE_DEV_FEATURES === 'true' ? true : exports.mode !== 'production';
