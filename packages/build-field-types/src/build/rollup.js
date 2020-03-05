const resolve = require('@rollup/plugin-node-resolve');
const resolveFrom = require('resolve-from');
const chalk = require('chalk');
import path from 'path';
import builtInModules from 'builtin-modules';
import { rollup as _rollup } from 'rollup';
import { FatalError } from '../errors';
import pkgJsonRedirectPlugin from '../rollup-plugins/pkg-json-redirect';
import babel from '../rollup-plugins/babel';
import { getNameForDist } from '../utils';
import { EXTENSIONS } from '../constants';

// this makes sure nested imports of external packages are external
const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

let unsafeRequire = require;

function getChildPeerDeps(finalPeerDeps, isUMD, depKeys, doneDeps, aliases, pkg) {
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

export let rollup = _rollup;

export function toUnsafeRollupConfig(config) {
  return config;
}

export let getRollupConfig = (pkg, entrypoints, aliases) => {
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
    onwarn: warning => {
      switch (warning.code) {
        case 'CIRCULAR_DEPENDENCY':
        case 'UNUSED_EXTERNAL_IMPORT': {
          break;
        }
        case 'UNRESOLVED_IMPORT': {
          if (/^@babel\/runtime\/helpers\//.test(warning.source)) {
            throw new FatalError(
              `Babel helpers (functions inserted by Babel transforms) should be imported from the @babel/runtime package to reduce bundle size but @babel/runtime is not in the dependencies of ${pkg.name}, please add it there.`,
              pkg
            );
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
      pkgJsonRedirectPlugin(),
    ].filter(Boolean),
  };

  return config;
};
