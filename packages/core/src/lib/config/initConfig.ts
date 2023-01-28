import { KeystoneConfig, IdFieldConfig } from '../../types';
import { idFieldType } from '../id-field';

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

  return { ...config, lists: applyIdFieldDefaults(config) };
}
