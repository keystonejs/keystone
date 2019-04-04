// @flow
import * as babel from "@babel/core";
import { createFilter } from "rollup-pluginutils";
import { getWorker } from "../../worker-client";

const regExpCharactersRegExp = /[\\^$.*+?()[\]{}|]/g;
const escapeRegExpCharacters = (str: string) =>
  str.replace(regExpCharactersRegExp, "\\$&");

const unpackOptions = ({
  extensions = babel.DEFAULT_EXTENSIONS,
  // rollup uses sourcemap, babel uses sourceMaps
  // just normalize them here so people don't have to worry about it
  sourcemap = true,
  sourcemaps = true,
  sourceMap = true,
  sourceMaps = true,
  ...rest
}: any = {}) => ({
  extensions,
  plugins: [],
  sourceMaps: sourcemap && sourcemaps && sourceMap && sourceMaps,
  ...rest,
  caller: {
    name: "rollup-plugin-babel",
    supportsStaticESM: true,
    supportsDynamicImport: true,
    ...rest.caller
  }
});

let rollupPluginBabel = (pluginOptions: *) => {
  const { exclude, extensions, include, ...babelOptions } = unpackOptions(
    pluginOptions
  );

  const extensionRegExp = new RegExp(
    `(${extensions.map(escapeRegExpCharacters).join("|")})$`
  );
  const includeExcludeFilter = createFilter(include, exclude);
  const filter = id => extensionRegExp.test(id) && includeExcludeFilter(id);

  return {
    name: "babel",
    transform(code: string, filename: string) {
      if (!filter(filename)) return Promise.resolve(null);
      let options = JSON.stringify({ ...babelOptions, filename });

      return getWorker().transformBabel(code, options);
    }
  };
};

export default rollupPluginBabel;
