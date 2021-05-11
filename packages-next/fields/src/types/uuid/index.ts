import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  types,
} from '@keystone-next/types';
import { v4 as genUUID } from 'uuid';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type UuidFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes>;

export const uuid =
  <TGeneratedListTypes extends BaseGeneratedListTypes>(
    config: UuidFieldConfig<TGeneratedListTypes> = {}
  ): FieldTypeFunc =>
  meta => {
    if (meta.fieldKey !== 'id') {
      throw new Error(
        `The uuid field type is only supported as an idField but is used at ${meta.fieldKey}.${meta.fieldKey}`
      );
    }
    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'String',
      nativeType: meta.provider === 'postgresql' ? 'Uuid' : undefined,
      default:
        meta.provider === 'postgresql'
          ? { kind: 'dbgenerated', value: 'gen_random_uuid()' }
          : { kind: 'uuid' },
    })({
      ...config,
      input: {
        create: {
          arg: undefined,
          resolve() {
            return genUUID();
          },
        },
        uniqueWhere: { arg: types.arg({ type: types.ID }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.ID }),
      views: resolveView('text/views'),
      getAdminMeta() {
        return { displayMode: 'input' };
      },
    });
  };
