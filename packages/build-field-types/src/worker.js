const babel = require('@babel/core');
const prettier = require('prettier');
const { minify } = require('terser');

exports.transformBabel = function transformBabel(code, options) {
  options = JSON.parse(options);
  let result = babel.transformSync(code, options);

  return Promise.resolve({ code: result.code, map: result.map });
};

exports.transformPrettier = function transformPrettier(code) {
  return Promise.resolve(prettier.format(code, { parser: 'babylon' }));
};

exports.transformTerser = (code, optionsString) => {
  const options = JSON.parse(optionsString);
  const result = minify(code, options);
  if (result.error) {
    throw result.error;
  } else {
    return result;
  }
};
