// @flow
import path from 'path';
import type { Plugin } from './types';
import { getDevPath, getProdPath } from '../build/utils';
import * as fs from 'fs-extra';

export default function flowAndNodeDevProdEntry(): Plugin {
  return {
    name: 'flow-and-prod-dev-entry',
    // eslint-disable-next-line no-unused-vars
    async generateBundle(opts, bundle, something) {
      for (const n in bundle) {
        const file = bundle[n];
        // $FlowFixMe
        let facadeModuleId = file.facadeModuleId;
        if (file.isAsset || !file.isEntry || facadeModuleId == null) {
          continue;
        }

        let flowMode = false;

        let source = await fs.readFile(facadeModuleId, 'utf8');
        if (source.includes('@flow')) {
          flowMode = file.exports.includes('default') ? 'all' : 'named';
        }
        let mainFieldPath = file.fileName.replace(/\.prod\.js$/, '.js');

        if (flowMode !== false) {
          let relativeToSource = path.relative(
            path.parse(path.join(opts.dir, file.fileName)).dir,
            facadeModuleId
          );
          let flowFileSource = `// @flow
export * from "${relativeToSource}";${
            flowMode === 'all' ? `\nexport { default } from "${relativeToSource}";` : ''
          }\n`;
          let flowFileName = mainFieldPath + '.flow';
          bundle[flowFileName] = {
            fileName: flowFileName,
            isAsset: true,
            source: flowFileSource,
          };
        }

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
