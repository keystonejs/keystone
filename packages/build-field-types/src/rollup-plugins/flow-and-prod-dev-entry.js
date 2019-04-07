// @flow
import path from 'path';
import type { Plugin } from './types';

export function esmPlugin(): Plugin {
  return {
    name: 'esm thing',
  };
}

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
      }
    },
  };
}
