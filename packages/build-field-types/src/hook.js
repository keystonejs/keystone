// @flow
let { EXTENSIONS } = require('./constants');
let { addHook } = require('pirates');
let babel = require('@babel/core');
let sourceMapSupport = require('source-map-support');

let babelPlugins = [
  require.resolve('./babel-plugins/ks-field-types-dev'),
  require.resolve('@babel/plugin-transform-runtime'),
  require.resolve('@babel/plugin-transform-modules-commonjs'),
];

exports.___internalHook = () => {
  let compiling = false;
  let sourceMaps = {};
  function compileHook(code, filename) {
    if (compiling) return code;

    try {
      compiling = true;
      let output = babel.transformSync(code, {
        plugins: babelPlugins,
        filename,
        sourceMaps: 'both',
      });
      sourceMaps[filename] = output.map;
      return output.code;
    } finally {
      compiling = false;
    }
  }
  sourceMapSupport.install({
    environment: 'node',
    retrieveSourceMap(source) {
      let map = sourceMaps[source];
      if (map !== undefined) {
        return {
          url: source,
          map,
        };
      } else {
        return null;
      }
    },
  });

  return addHook(compileHook, {
    exts: EXTENSIONS,
  });
};
