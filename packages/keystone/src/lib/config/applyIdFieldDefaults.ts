import type { KeystoneConfig } from '../../types';
import { idFieldType } from '../id-field';

/* Validate lists config and default the id field */
export function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  const lists: KeystoneConfig['lists'] = {};
  const defaultIdField = config.db.idField ?? { kind: 'cuid' };
  Object.keys(config.lists).forEach(key => {
    const listConfig = config.lists[key];
    if (listConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    const idField = idFieldType(listConfig.db?.idField ?? defaultIdField);

    const fields = { id: idField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });
  return lists;
}
