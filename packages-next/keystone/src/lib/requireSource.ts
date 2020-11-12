/*
This is a slightly-modified version of preconstruct's hook for use with
keystone project files in the monorepo. Importantly it doesn't accept a cwd and
sets rootMode: "upward-optional"
*/

import { addHook } from 'pirates';
import * as babel from '@babel/core';
import sourceMapSupport from 'source-map-support';

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const babelPlugins = [require.resolve('@babel/plugin-transform-modules-commonjs')];

export const hook = () => {
  let compiling = false;
  let sourceMaps: Record<string, any> = {};
  let needsToInstallSourceMapSupport = true;
  function compileHook(code: string, filename: string) {
    if (compiling) return code;
    // we do this lazily because jest has its own require implementation
    // which means preconstruct's require hook won't be run
    // so we don't want to install source map support because that will mess up
    // jest's source map support
    if (needsToInstallSourceMapSupport) {
      sourceMapSupport.install({
        environment: 'node',
        retrieveSourceMap(source) {
          let map = sourceMaps[source];
          if (map !== undefined) {
            return { url: source, map };
          } else {
            return null;
          }
        },
      });
      needsToInstallSourceMapSupport = false;
    }
    try {
      compiling = true;
      let output = babel.transformSync(code, {
        plugins: babelPlugins,
        filename,
        sourceMaps: 'both',
        rootMode: 'upward-optional',
      })!;
      sourceMaps[filename] = output.map;
      return output.code!;
    } finally {
      compiling = false;
    }
  }
  return addHook(compileHook, {
    exts: EXTENSIONS,
  });
};

export const requireSource = (filePath: string) => {
  const unregister = hook();
  const result = require(filePath);
  unregister();
  return result;
};
