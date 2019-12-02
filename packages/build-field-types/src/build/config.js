import { getRollupConfig } from './rollup';

let getNames = ext => {
  return {
    entryFileNames: `[name]${ext}`,
    chunkFileNames: `dist/[name]-[hash]${ext}`,
  };
};

export function getRollupConfigs(pkg, aliases) {
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
