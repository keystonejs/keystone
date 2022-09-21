import type { KeystoneConfig } from '../../types';
import { idFieldType } from '../id-field';

/* Validate lists config and default the id field */
export function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  const lists: KeystoneConfig['lists'] = {};
  const defaultIdField = config.db.idField ?? { kind: 'cuid' };
  if (
    defaultIdField.kind === 'autoincrement' &&
    defaultIdField.type === 'BigInt' &&
    config.db.provider === 'sqlite'
  ) {
    throw new Error(
      'BigInt autoincrements are not supported on SQLite but they are configured as the global id field type at db.idField'
    );
  }
  Object.keys(config.lists).forEach(key => {
    const listConfig = config.lists[key];
    if (listConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    if (
      listConfig.db?.idField?.kind === 'autoincrement' &&
      listConfig.db.idField.type === 'BigInt' &&
      config.db.provider === 'sqlite'
    ) {
      throw new Error(
        `BigInt autoincrements are not supported on SQLite but they are configured at db.idField on the ${key} list`
      );
    }

    if (listConfig.isSingleton && listConfig.db?.idField) {
      throw new Error(
        `A singleton list cannot specify an idField, but it is configured at db.idField on the ${key} list`
      );
    }
    const idFieldConfig = listConfig.db?.idField ?? defaultIdField;

    const idField = idFieldType(idFieldConfig, !!listConfig.isSingleton);

    const fields = { id: idField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });
  return lists;
}
