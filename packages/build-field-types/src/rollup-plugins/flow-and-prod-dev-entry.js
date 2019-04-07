// @flow
import path from 'path';
import type { Plugin } from './types';
import { getDevPath, getProdPath } from '../build/utils';

export default function flowAndNodeDevProdEntry(): Plugin {
  return {
    name: 'flow-and-prod-dev-entry',
    // eslint-disable-next-line no-unused-vars
    async generateBundle(opts, bundle, something) {
      for (const n in bundle) {
        const file = bundle[n];
        // $FlowFixMe
        let facadeModuleId = file.facadeModuleId;
        if (file.isAsset || !(file.isEntry || file.isDynamicEntry) || facadeModuleId == null) {
          continue;
        }

        if (file.isDynamicEntry) {
          let pkgJsonFileName = path.join(path.dirname(file.fileName), 'package.json');
          bundle[pkgJsonFileName] = {
            fileName: pkgJsonFileName,
            isAsset: true,
            source:
              JSON.stringify({ main: 'chunk.cjs.js', module: 'chunk.esm.js' }, null, 2) + '\n',
          };
        }

        let mainFieldPath = file.fileName.replace(/\.prod\.js$/, '.js');

        let mainEntrySource = `'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./${path.basename(getProdPath(mainFieldPath))}");
} else {
  module.exports = require("./${path.basename(getDevPath(mainFieldPath))}");
}\n`;
        bundle[mainFieldPath] = {
          fileName: mainFieldPath,
          isAsset: true,
          source: mainEntrySource,
        };
      }
    },
  };
}
