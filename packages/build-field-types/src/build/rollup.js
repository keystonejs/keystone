// @flow
const resolve = require('rollup-plugin-node-resolve');
const resolveFrom = require('resolve-from');
const chalk = require('chalk');
import path from 'path';
import builtInModules from 'builtin-modules';
import { Package } from '../package';
import { StrictEntrypoint } from '../entrypoint';
import { rollup as _rollup } from 'rollup';
import type { Aliases } from './aliases';
import { FatalError } from '../errors';
import { confirms } from '../messages';
import flowAndNodeDevProdEntry from '../rollup-plugins/flow-and-prod-dev-entry';
import babel from '../rollup-plugins/babel';
import { limit } from '../prompt';
import { getNameForDist } from '../utils';
import { EXTENSIONS } from '../constants';

import installPackages from 'install-packages';

// this makes sure nested imports of external packages are external
const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id: string) => pattern.test(id);
};

let unsafeRequire = require;

function getChildPeerDeps(
  finalPeerDeps: Array<string>,
  isUMD: boolean,
  depKeys: Array<string>,
  doneDeps: Array<string>,
  aliases: Aliases,
  pkg: Package
) {
  depKeys
    .filter(x => !doneDeps.includes(x))
    .forEach(key => {
      let pkgJson;
      try {
        pkgJson = unsafeRequire(resolveFrom(pkg.directory, key + '/package.json'));
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          return;
        }
        throw err;
      }
      if (pkgJson.peerDependencies) {
        finalPeerDeps.push(...Object.keys(pkgJson.peerDependencies));
        getChildPeerDeps(
          finalPeerDeps,
          isUMD,
          Object.keys(pkgJson.peerDependencies),
          doneDeps,
          aliases,
          pkg
        );
      }
    });
}

import type { RollupSingleFileBuild } from './types';

export let rollup: RollupConfig => Promise<RollupSingleFileBuild> = _rollup;

export opaque type RollupConfig = Object;

export function toUnsafeRollupConfig(config: RollupConfig): Object {
  return config;
}

export let getRollupConfig = (
  pkg: Package,
  entrypoints: Array<StrictEntrypoint>,
  aliases: Aliases
): RollupConfig => {
  let external = [];
  if (pkg.peerDependencies) {
    external.push(...Object.keys(pkg.peerDependencies));
  }
  if (pkg.dependencies) {
    external.push(...Object.keys(pkg.dependencies));
  }
  getChildPeerDeps(external, false, external, [], aliases, pkg);
  external.push(...builtInModules);

  let rollupAliases = {};

  Object.keys(aliases).forEach(key => {
    try {
      rollupAliases[key] = resolveFrom(pkg.directory, aliases[key]);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }
  });

  let input = {};

  entrypoints.forEach(entrypoint => {
    input[
      path.relative(
        pkg.directory,
        path.join(entrypoint.directory, 'dist', getNameForDist(pkg.name))
      )
    ] = entrypoint.strict().source;
  });

  const config = {
    input,
    external: makeExternalPredicate(external),
    onwarn: (warning: *) => {
      switch (warning.code) {
        case 'CIRCULAR_DEPENDENCY':
        case 'UNUSED_EXTERNAL_IMPORT': {
          break;
        }
        case 'UNRESOLVED_IMPORT': {
          if (/^@babel\/runtime\/helpers\//.test(warning.source)) {
            throw (async () => {
              let shouldInstallBabelRuntime = await confirms.shouldInstallBabelRuntime(pkg);

              if (shouldInstallBabelRuntime) {
                await limit(() =>
                  installPackages({
                    packages: ['@babel/runtime'],
                    cwd: pkg.directory,
                    installPeers: false,
                    packageManager: pkg.project.isBolt ? 'bolt' : undefined,
                  })
                );
                await pkg.refresh();
              } else {
                throw new FatalError(
                  `@babel/runtime should be in dependencies of ${pkg.name}`,
                  pkg
                );
              }
            })();
          }
          if (!warning.source.startsWith('.')) {
            throw new FatalError(
              `"${warning.source}" is imported by "${path.relative(
                pkg.directory,
                warning.importer
              )}" but it is not specified in dependencies or peerDependencies`,
              pkg
            );
          }
          throw new FatalError(
            `"${warning.source}" is imported by "${path.relative(
              pkg.directory,
              warning.importer
            )}" but it could not be resolved`,
            pkg
          );
        }
        default: {
          throw new FatalError(
            `There was an error compiling ${pkg.name}: ${chalk.red(warning.toString())}`,
            pkg
          );
        }
      }
    },
    plugins: [
      babel({
        cwd: pkg.project.directory,
        plugins: [
          [require.resolve('../babel-plugins/ks-field-types-in-babel'), { pkgDir: pkg.directory }],
          [require.resolve('@babel/plugin-transform-runtime'), { useESModules: true }],
        ],
        extensions: EXTENSIONS,
      }),
      resolve({
        extensions: EXTENSIONS,
        customResolveOptions: {
          moduleDirectory: [],
        },
      }),
      flowAndNodeDevProdEntry(),
    ].filter(Boolean),
  };

  return config;
};
