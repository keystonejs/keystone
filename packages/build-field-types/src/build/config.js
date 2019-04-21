// @flow
import { Package } from '../package';
import { type RollupConfig, getRollupConfig } from './rollup';
import type { OutputOptions } from './types';
import type { Aliases } from './aliases';

let getNames = (ext: string) => {
  return {
    entryFileNames: `[name]${ext}`,
    chunkFileNames: `dist/[name]-[hash]${ext}`,
  };
};

export function getRollupConfigs(
  pkg: Package,
  aliases: Aliases
): Array<{
  config: RollupConfig,
  outputs: Array<OutputOptions>,
}> {
  let strictEntrypoints = pkg.entrypoints.map(x => x.strict());

  let configs = [
    {
      config: getRollupConfig(pkg, strictEntrypoints, aliases),
      outputs: [
        {
          format: 'es',
          ...getNames('.esm.js'),
          dir: pkg.directory,
        },
        {
          format: 'cjs',
          ...getNames('.cjs.js'),
          dir: pkg.directory,
          exports: 'named',
        },
      ],
    },
  ];

  return configs;
}
