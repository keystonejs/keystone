// @flow
import { Package } from '../package';
import { type RollupConfig, getRollupConfig } from './rollup';
import type { OutputOptions } from './types';
import type { Aliases } from './aliases';
import is from 'sarcastic';
import resolveFrom from 'resolve-from';

let unsafeRequire = require;

function getChildDeps(
  finalPeerDeps: Array<string>,
  depKeys: Array<string>,
  doneDeps: Array<string>,
  aliases: Aliases,
  pkg: Package
) {
  depKeys
    .filter(x => !doneDeps.includes(x))
    .forEach(key => {
      let pkgJson = unsafeRequire(resolveFrom(pkg.directory, key + '/package.json'));

      if (pkgJson.peerDependencies) {
        finalPeerDeps.push(...Object.keys(pkgJson.peerDependencies));
      }
      if (pkgJson.dependencies) {
        doneDeps.push(...Object.keys(pkgJson.dependencies));
        getChildDeps(finalPeerDeps, Object.keys(pkgJson.dependencies), doneDeps, aliases, pkg);
      }
    });
}

function getGlobals(pkg: Package, aliases) {
  let stuff = [];

  if (pkg.peerDependencies) {
    stuff.push(...Object.keys(pkg.peerDependencies));
  }
  if (pkg.dependencies) {
    stuff.push(...Object.keys(pkg.dependencies));
  }

  if (stuff.length === 0) {
    return {};
  }

  let finalPeerDeps = pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [];

  getChildDeps(finalPeerDeps, stuff, [], aliases, pkg);

  return finalPeerDeps.reduce((obj, pkgName) => {
    obj[pkgName] = pkg.project.global(pkgName);
    return obj;
  }, {});
}

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

  // umd builds are a bit special
  // we don't guarantee that shared modules are shared across umd builds
  // this is just like dependencies, they're bundled into the umd build
  if (strictEntrypoints[0].umdMain !== null)
    {pkg.entrypoints
      .map(x => x.strict())
      .forEach(entrypoint => {
        let umdName = is(entrypoint._config.umdName, is.string);
        is(entrypoint.umdMain, is.string);

        configs.push({
          config: getRollupConfig(pkg, [entrypoint], aliases, 'umd'),
          outputs: [
            {
              format: 'umd',
              sourcemap: true,
              entryFileNames: '[name].umd.min.js',
              name: umdName,
              dir: pkg.directory,
              globals: getGlobals(pkg, aliases),
            },
          ],
        });
      });}

  let hasBrowserField = strictEntrypoints[0].browser !== null;

  if (hasBrowserField) {
    // i just realised that we're making the assumption that if you have a browser build
    // you also have a module build. I feel like this is probably a safe assumption
    // but might want to think about more.

    configs.push({
      config: getRollupConfig(pkg, strictEntrypoints, aliases, 'browser'),
      outputs: [
        {
          format: 'cjs',
          entryFileNames: '[name].browser.cjs.js',
          chunkFileNames: 'dist/[name]-[hash].browser.cjs.js',
          dir: pkg.directory,
          exports: 'named',
        },
        ...(hasModuleField
          ? [
              {
                format: 'es',
                entryFileNames: '[name].browser.esm.js',
                chunkFileNames: 'dist/[name]-[hash].browser.esm.js',
                dir: pkg.directory,
              },
            ]
          : []),
      ],
    });
  }

  if (strictEntrypoints[0].reactNative !== null) {
    configs.push({
      config: getRollupConfig(pkg, strictEntrypoints, aliases, 'react-native'),
      outputs: [
        {
          format: 'cjs',
          entryFileNames: '[name].native.cjs.js',
          chunkFileNames: 'dist/[name]-[hash].native.cjs.js',
          dir: pkg.directory,
          exports: 'named',
        },
        ...(hasModuleField
          ? [
              {
                format: 'es',
                entryFileNames: '[name].native.esm.js',
                chunkFileNames: 'dist/[name]-[hash].native.esm.js',
                dir: pkg.directory,
              },
            ]
          : []),
      ],
    });
  }
  return configs;
}
