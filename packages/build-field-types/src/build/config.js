// @flow
import { Package } from '../package';
import { type RollupConfig, getRollupConfig } from './rollup';
import type { OutputOptions } from './types';
import type { Aliases } from './aliases';

export function getRollupConfigs(pkg: Package, aliases: Aliases) {
  let configs: Array<{
    config: RollupConfig,
    outputs: Array<OutputOptions>,
  }> = [];

  let strictEntrypoints = pkg.entrypoints.map(x => x.strict());

  let hasModuleField = strictEntrypoints[0].module !== null;

  configs.push({
    config: getRollupConfig(pkg, strictEntrypoints, aliases, 'node-dev'),
    outputs: [
      {
        format: 'cjs',
        entryFileNames: '[name].cjs.dev.js',
        chunkFileNames: 'dist/[name]-[hash].cjs.dev.js',
        dir: pkg.directory,
        exports: 'named',
      },
      ...(hasModuleField
        ? [
            {
              format: 'es',
              entryFileNames: '[name].esm.js',
              chunkFileNames: 'dist/[name]-[hash].esm.js',
              dir: pkg.directory,
            },
          ]
        : []),
    ],
  });

  configs.push({
    config: getRollupConfig(pkg, strictEntrypoints, aliases, 'node-prod'),
    outputs: [
      {
        format: 'cjs',
        entryFileNames: '[name].cjs.prod.js',
        chunkFileNames: 'dist/[name]-[hash].cjs.prod.js',
        dir: pkg.directory,
        exports: 'named',
      },
    ],
  });

  return configs;
}
