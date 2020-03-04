import { createFilter } from '@rollup/pluginutils';
import { getWorker } from '../worker-client';

const regExpCharactersRegExp = /[\\^$.*+?()[\]{}|]/g;
const escapeRegExpCharacters = str => str.replace(regExpCharactersRegExp, '\\$&');

const unpackOptions = (options = {}) => ({
  plugins: [],
  ...options,

  caller: {
    name: 'rollup-plugin-babel',
    supportsStaticESM: true,
    supportsDynamicImport: true,
    ...options.caller,
  },
});

let rollupPluginBabel = pluginOptions => {
  const { exclude, extensions, include, ...babelOptions } = unpackOptions(pluginOptions);

  const extensionRegExp = new RegExp(`(${extensions.map(escapeRegExpCharacters).join('|')})$`);
  const includeExcludeFilter = createFilter(include, exclude);
  const filter = id => extensionRegExp.test(id) && includeExcludeFilter(id);

  return {
    name: 'babel',
    transform(code, filename) {
      if (!filter(filename)) return Promise.resolve(null);
      let options = JSON.stringify({ ...babelOptions, filename });

      return getWorker().transformBabel(code, options);
    },
  };
};

export default rollupPluginBabel;
