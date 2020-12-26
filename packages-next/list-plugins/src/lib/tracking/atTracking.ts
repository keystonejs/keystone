import { timestamp } from '@keystone-next/fields';
import { ListConfig, FieldConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/types';
import { AtTrackingOptions, ResolveInputHook } from '../types';
import { composeHook } from '../utils';

export function withAtTracking<Fields extends BaseFields<BaseGeneratedListTypes>>(listConfig: ListConfig<BaseGeneratedListTypes, Fields>, options: AtTrackingOptions = {}): ListConfig<BaseGeneratedListTypes, Fields> {
  const { created = true, updated = true, createdAtField = 'createdAt', updatedAtField = 'updatedAt', ...atFieldOptions } = options;

  const fieldOptions: FieldConfig<BaseGeneratedListTypes> = {
    access: {
      read: true,
      create: false,
      update: false,
    },
    ui: {
      itemView: {
        fieldMode: 'read',
      }
    },
    ...atFieldOptions,
  };

  let fields = { ...listConfig.fields };
  if (updated) {
    fields = {
      ...fields,
      [updatedAtField]: timestamp(fieldOptions),
    };
  };

  if (created) {
    fields = {
      ...fields,
      [createdAtField]: timestamp(fieldOptions),
    };
  };

  const newResolveInput: ResolveInputHook = ({ resolvedData, operation }) => {
    const dateNow = new Date().toISOString();
    if (operation === 'create') {
      // create mode
      if (created) {
        resolvedData[createdAtField] = dateNow;
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    }
    if (operation === 'update') {
      // update mode

      if (created) {
        delete resolvedData[createdAtField]; // createdAtField No longer sent by api/admin, but access control can be skipped!
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    }
    return resolvedData;
  };

  const originalResolveInput = listConfig.hooks?.resolveInput;
  const resolveInput: ResolveInputHook = composeHook(originalResolveInput, newResolveInput);
  return {
    ...listConfig,
    fields: {
      ...listConfig.fields,
      ...fields,
    },
    hooks: {
      ...listConfig.hooks,
      resolveInput,
    }
  };
};
