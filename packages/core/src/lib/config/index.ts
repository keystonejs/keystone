import esbuild, { BuildOptions } from 'esbuild';
import { KeystoneConfig, IdFieldConfig } from '../../types';
import { getBuiltKeystoneConfigurationPath } from '../../artifacts';
import { idFieldType } from '../id-field';

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

function getIdField({ kind, type }: IdFieldConfig): Required<IdFieldConfig> {
  if (kind === 'cuid') return { kind: 'cuid', type: 'String' };
  if (kind === 'uuid') return { kind: 'uuid', type: 'String' };
  if (kind === 'autoincrement') {
    if (type === 'BigInt') return { kind: 'autoincrement', type: 'BigInt' };
    return { kind: 'autoincrement', type: 'Int' };
  }

  // the default idFieldType
  return { kind: 'cuid', type: 'String' };
}

/* Validate lists config and default the id field */
function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  const defaultIdField = getIdField(config.db.idField ?? { kind: 'cuid' });
  if (
    defaultIdField.kind === 'autoincrement' &&
    defaultIdField.type === 'BigInt' &&
    config.db.provider === 'sqlite'
  ) {
    throw new Error(
      'BigInt autoincrements are not supported on SQLite but they are configured as the global id field type at db.idField'
    );
  }

  // some error checking
  for (const [listKey, list] of Object.entries(config.lists)) {
    if (list.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          listKey
        )} list. This is not allowed, use the idField option instead.`
      );
    }

    if (
      list.db?.idField?.kind === 'autoincrement' &&
      list.db.idField.type === 'BigInt' &&
      config.db.provider === 'sqlite'
    ) {
      throw new Error(
        `BigInt autoincrements are not supported on SQLite but they are configured at db.idField on the ${listKey} list`
      );
    }

    if (list.isSingleton && list.db?.idField) {
      throw new Error(
        `A singleton list cannot specify an idField, but it is configured at db.idField on the ${listKey} list`
      );
    }
  }

  // inject the ID fields
  const listsWithIds: KeystoneConfig['lists'] = {};

  for (const [listKey, list] of Object.entries(config.lists)) {
    if (list.isSingleton) {
      // Singletons can only use an Int, idFieldType function ignores the `kind` if isSingleton is true
      listsWithIds[listKey] = {
        ...list,
        fields: {
          id: idFieldType(
            {
              kind: 'autoincrement',
              type: 'Int',
            },
            true
          ),
          ...list.fields,
        },
      };

      continue;
    }

    listsWithIds[listKey] = {
      ...list,
      fields: {
        id: idFieldType(getIdField(list.db?.idField ?? defaultIdField), false),
        ...list.fields,
      },
    };
  }

  return listsWithIds;
}

/*
  This function executes the validation and other initialisation logic that
  needs to be run on Keystone Config before it can be used.
*/

export function initConfig(config: KeystoneConfig) {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new Error(
      'Invalid db configuration. Please specify db.provider as either "sqlite", "postgresql" or "mysql"'
    );
  }

  return {
    ...config,
    lists: applyIdFieldDefaults(config),
  };
}

export function loadBuiltConfig(path: string) {
  return initConfig(require(path).default);
}

export async function loadConfigOnce(cwd: string) {
  await esbuild.build(getEsbuildConfig(cwd));
  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd);
  return loadBuiltConfig(builtConfigPath);
}
