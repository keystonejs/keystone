// WARNING: be careful not to import `esbuild` within next
import type { BuildOptions } from 'esbuild';

export function getEsbuildConfig(cwd: string): BuildOptions {
  return {
    entryPoints: ['./keystone'],
    absWorkingDir: cwd,
    bundle: true,
    sourcemap: true,
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
