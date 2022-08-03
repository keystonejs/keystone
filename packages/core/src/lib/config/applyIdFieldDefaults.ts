import type { KeystoneConfig } from '../../types';
import { idFieldType } from '../id-field';

/* Validate models config and default the id field */
export function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['models'] {
  const models: KeystoneConfig['models'] = {};
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
    const modelConfig = config.models[key];
    if (modelConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    if (
      modelConfig.db?.idField?.kind === 'autoincrement' &&
      modelConfig.db.idField.type === 'BigInt' &&
      config.db.provider === 'sqlite'
    ) {
      throw new Error(
        `BigInt autoincrements are not supported on SQLite but they are configured at db.idField on the ${key} list`
      );
    }
    const idField = idFieldType(modelConfig.db?.idField ?? defaultIdField);

    const fields = { id: idField, ...modelConfig.fields };
    models[key] = { ...modelConfig, fields };
  });
  return models;
}
