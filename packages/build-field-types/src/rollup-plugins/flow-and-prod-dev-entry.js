// @flow
import path from 'path';
import type { Plugin, OutputChunk } from './types';
import { getWorker } from '../worker-client';
import hashString from '@emotion/hash';
import * as fse from 'fs-extra';
import fs from 'fs';

function transformStuff(format, code, pkgDir, filename) {
  if (format === 'cjs') {
    return getWorker()
      .transformBabel(
        code,
        JSON.stringify({
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            require.resolve('../babel-plugins/rewrite-cjs-runtime-helpers'),
            [require.resolve('../babel-plugins/ks-field-types-render-chunk'), { pkgDir, filename }],
          ],
        })
      )
      .then(output => output.code + '\n');
  }
  if (format === 'es') {
    return getWorker()
      .transformBabel(
        code,
        JSON.stringify({
          babelrc: false,
          configFile: false,
          plugins: [
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            [require.resolve('../babel-plugins/ks-field-types-render-chunk'), { pkgDir, filename }],
          ],
        })
      )
      .then(output => output.code + '\n');
  }
  throw new Error('unknown case');
}

let map = new WeakMap();

export default function flowAndNodeDevProdEntry(): Plugin {
  return {
    name: 'flow-and-prod-dev-entry',
    // eslint-disable-next-line no-unused-vars
    async generateBundle(opts, bundle, something) {
      map.set(this.addWatchFile, opts.dir);
      let chunkKeys = Object.keys(bundle).filter(
        x =>
          // $FlowFixMe
          !bundle[x].isAsset
      );

      let format: string = (opts.format: any);
      let pkgDir: string = (opts.dir: any);

      await Promise.all(
        chunkKeys.map(async key => {
          let file: OutputChunk = (bundle[key]: any);

          file.code = await transformStuff(format, file.code, pkgDir, file.fileName);
        })
      );
    },
    async writeBundle(bundle) {
      let pkgDir = map.get(this.addWatchFile);
      if (!pkgDir) {
        throw new Error(
          'pkgDir not found, this is likely a bug in build-field-types. Please open an issue with a reproduction.'
        );
      }
      for (const n in bundle) {
        const file = bundle[n];
        // $FlowFixMe
        let facadeModuleId = file.facadeModuleId;
        if (!file.isAsset && file.isDynamicEntry && facadeModuleId != null) {
          let hash = hashString(path.relative(pkgDir, facadeModuleId));
          let pkgJsonFileName = path.join(pkgDir, 'dist', hash, 'package.json');
          let pkgJsonField = file.fileName.endsWith('.esm.js') ? 'module' : 'main';
          let json = {};
          try {
            json = JSON.parse(fs.readFileSync(pkgJsonFileName, 'utf8'));
          } catch (err) {
            if (err.code !== 'ENOENT') {
              throw err;
            }
          }
          json[pkgJsonField] = path.relative(
            path.dirname(pkgJsonFileName),
            path.join(pkgDir, file.fileName)
          );

          fse.ensureFileSync(pkgJsonFileName);
          fs.writeFileSync(pkgJsonFileName, JSON.stringify(json, null, 2) + '\n');
        }
      }
    },
  };
}
