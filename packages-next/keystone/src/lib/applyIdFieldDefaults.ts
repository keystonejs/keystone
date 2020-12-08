import type { KeystoneConfig } from '@keystone-next/types';
import { autoIncrement, mongoId } from '@keystone-next/fields';

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
    let idField =
      config.lists[key].idField ??
      { mongoose: mongoId({}), knex: autoIncrement({}), prisma_postgresql: autoIncrement({}) }[
        config.db.adapter
      ];
    idField = {
      ...idField,
      config: {
        ui: {
          createView: { fieldMode: 'hidden', ...idField.config.ui?.createView },
          itemView: { fieldMode: 'hidden', ...idField.config.ui?.itemView },
          ...idField.config.ui,
        },
        ...idField.config,
      },
    };

    const fields = { id: idField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });
  return lists;
}
