import type { FieldData, KeystoneConfig, NextFieldType } from '@keystone-next/types';
import { idFieldType } from '../id-field';

/* Validate lists config and default the id field */
export function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  const lists: KeystoneConfig['lists'] = {};
  Object.keys(config.lists).forEach(key => {
    const listConfig = config.lists[key];
    if (listConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    const idFieldConfig = config.lists[key].idField ?? { kind: 'cuid' };
    const actualIdField = (args: FieldData): NextFieldType => {
      const idField = idFieldType(idFieldConfig)(args);
      return {
        ...idField,
        ui: {
          createView: { fieldMode: 'hidden', ...idField.ui?.createView },
          itemView: { fieldMode: 'hidden', ...idField.ui?.itemView },
          ...idField.ui,
        },
      };
    };

    const fields = { id: actualIdField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });
  return lists;
}
