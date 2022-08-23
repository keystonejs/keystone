import type { KeystoneConfig } from '../../types';
import { idFieldType } from '../id-field';

/* Validate lists config and default the id field */
export function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['models'] {
  const lists: KeystoneConfig['models'] = {};
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
  Object.keys(config.models).forEach(key => {
    const listConfig = config.models[key];
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
    const idField = idFieldType(listConfig.db?.idField ?? defaultIdField);

    const fields = { id: idField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });
  return lists;
}
