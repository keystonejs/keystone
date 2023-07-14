import type { KeystoneConfig, IdFieldConfig } from '../types';
import { idFieldType } from './id-field';

// TODO: move to system/initialisation
function getIdField({ kind, type }: IdFieldConfig): Required<IdFieldConfig> {
  if (kind === 'cuid') return { kind: 'cuid', type: 'String' };
  if (kind === 'cuid2') return { kind: 'cuid2', type: 'String' };
  if (kind === 'uuid') return { kind: 'uuid', type: 'String' };
  if (kind === 'string') return { kind: 'string', type: 'String' };
  if (kind === 'autoincrement') {
    if (type === 'BigInt') return { kind: 'autoincrement', type: 'BigInt' };
    return { kind: 'autoincrement', type: 'Int' };
  }

  throw new Error(`Unknown id type ${kind}`);
}

function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  // some error checking
  for (const [listKey, list] of Object.entries(config.lists)) {
    if (list.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          listKey
        )} list. This is not allowed, use the idField option instead.`
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

    const idField = getIdField(list.db?.idField ?? config.db.idField ?? { kind: 'cuid' });
    listsWithIds[listKey] = {
      ...list,
      fields: {
        id: idFieldType(idField, false),
        ...list.fields,
      },
    };
  }

  return listsWithIds;
}

export function initConfig(config: KeystoneConfig) {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new TypeError(
      'Invalid db configuration. Please specify db.provider as either "sqlite", "postgresql" or "mysql"'
    );
  }

  // WARNING: Typescript should prevent this, but empty string is useful for Prisma errors
  config.db.url ??= 'postgres://';

  // TODO: use zod or something if want to follow this path
  return {
    ...config,
    lists: applyIdFieldDefaults(config),
  };
}
