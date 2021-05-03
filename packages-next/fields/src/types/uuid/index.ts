import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  sortDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type UuidFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes>;

export const uuid = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: UuidFieldConfig<TGeneratedListTypes> = {}
): FieldTypeFunc => meta => {
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
      uniqueWhere: { arg: types.arg({ type: types.ID }) },
      sortBy: { arg: types.arg({ type: sortDirectionEnum }) },
    },
    output: types.field({ type: types.ID }),
    views: resolveView('text/views'),
    getAdminMeta() {
      return { displayMode: 'input' };
    },
  });
};
