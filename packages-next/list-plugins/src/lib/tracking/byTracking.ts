
import { AuthedRelationship } from '@keystonejs/fields-authed-relationship';

import { relationship } from '@keystone-next/fields';
import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/types';
import { ByTrackingOptions, ResolveInputHook } from '../types';
import { composeHook } from '../utils';
import { RelationshipFieldConfig } from '@keystone-next/fields/src/types/relationship';

export function withByTracking<Fields extends BaseFields<BaseGeneratedListTypes>>(listConfig: ListConfig<BaseGeneratedListTypes, Fields>, options: ByTrackingOptions = {}): ListConfig<BaseGeneratedListTypes, Fields> {
  const { created = true, updated = true, ref = 'User', createdByField = 'createdBy', updatedByField = 'updatedBy', ...byFieldOptions } = options;

  const fieldOptions: RelationshipFieldConfig<BaseGeneratedListTypes> = {
    ref,
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
    ...byFieldOptions,
  };

  let fields = { ...listConfig.fields };
  if (updated) {
    fields = {
      ...fields,
      [updatedByField]: { ...relationship(fieldOptions), type: AuthedRelationship, ...byFieldOptions }
    };
  };

  if (created) {
    fields = {
      ...fields,
      [createdByField]: { ...relationship(fieldOptions), type: AuthedRelationship, ...byFieldOptions },
    };
  };

  const newResolveInput: ResolveInputHook = ({ resolvedData, operation, context }) => {
    // If not logged in, the id is set to `null`
    const { session: { itemId = null, listKey = null } = {} } = context;

    // this avoids connecting item if the auth list is different than the list key
    if (listKey === ref) {
      if (operation === 'create') {
        // create mode
        if (created) {
          resolvedData[createdByField] = itemId;
        }
        if (updated) {
          resolvedData[updatedByField] = itemId;
        }
      }
      if (operation === 'update') {
        // update mode

        // do not allow overriding createdBy field
        if (created) {
          delete resolvedData[createdByField]; // createdByField No longer sent by api/admin, but access control can be skipped!
        }
        // opted-in to updatedBy tracking
        if (updated) {
          resolvedData[updatedByField] = itemId;
        }
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
