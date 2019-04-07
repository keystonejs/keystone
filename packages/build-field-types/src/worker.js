const babel = require('@babel/core');

exports.transformBabel = function transformBabel(code, options) {
  options = JSON.parse(options);
  let result = babel.transformSync(code, options);

  return Promise.resolve({ code: result.code, map: result.map });
};
