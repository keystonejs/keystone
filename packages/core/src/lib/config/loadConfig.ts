import esbuild, { BuildOptions } from 'esbuild';
import { getBuiltKeystoneConfigurationPath } from '../../artifacts';
import { KeystoneConfig } from '../../types';
import { initConfig } from './initConfig';

export function getEsbuildConfig(cwd: string): BuildOptions {
  return {
    entryPoints: ['./keystone'],
    absWorkingDir: cwd,
    bundle: true,
    // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
    outfile: '.keystone/config.js',
    format: 'cjs',
    platform: 'node',
    plugins: [
      {
        name: 'external-node_modules',
        setup(build) {
          build.onResolve(
            {
              // this regex is intended to be the opposite of /^\.\.?(?:\/|$)/
              // so it matches anything that isn't a relative import
              // so this means that we're only going to bundle relative imports
              // we can't use a negative lookahead/lookbehind because this regex is executed
              // by Go's regex package which doesn't support them
              // this regex could have less duplication with nested groups but this is probably easier to read
              filter: /(?:^[^.])|(?:^\.[^/.])|(?:^\.\.[^/])/,
            },
            args => {
              return { external: true, path: args.path };
            }
          );
        },
      },
    ],
  };
}

export function loadBuiltConfig(path: string): KeystoneConfig {
  return initConfig(require(path).default);
}

export async function loadConfigOnce(cwd: string): Promise<KeystoneConfig> {
  await esbuild.build(getEsbuildConfig(cwd));
  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd);
  return loadBuiltConfig(builtConfigPath);
}
