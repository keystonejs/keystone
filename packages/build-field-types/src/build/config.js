// @flow
import { Package } from '../package';
import { type RollupConfig, getRollupConfig } from './rollup';
import type { OutputOptions } from './types';
import type { Aliases } from './aliases';

let getNames = (ext: string) => {
  return {
    entryFileNames: `[name]${ext}`,
    chunkFileNames: `dist/[name]/chunk${ext}`,
  };
};

export function getRollupConfigs(pkg: Package, aliases: Aliases) {
  let configs: Array<{
    config: RollupConfig,
    outputs: Array<OutputOptions>,
  }> = [];

  let strictEntrypoints = pkg.entrypoints.map(x => x.strict());

  configs.push({
    config: getRollupConfig(pkg, strictEntrypoints, aliases, 'node-dev'),
    outputs: [
      {
        format: 'cjs',
        ...getNames('.cjs.dev.js'),
        dir: pkg.directory,
        exports: 'named',
      },
      {
        format: 'es',
        ...getNames('.esm.js'),
        dir: pkg.directory,
      },
    ],
  });

  configs.push({
    config: getRollupConfig(pkg, strictEntrypoints, aliases, 'node-prod'),
    outputs: [
      {
        format: 'cjs',
        ...getNames('.cjs.prod.js'),
        dir: pkg.directory,
        exports: 'named',
      },
    ],
  });

  return configs;
}
