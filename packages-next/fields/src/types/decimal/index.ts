import {
  fieldType,
  FieldTypeFunc,
  BaseGeneratedListTypes,
  types,
  filters,
  orderDirectionEnum,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type DecimalFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    // isRequired?: boolean;
    precision?: number;
    scale?: number;
    index?: 'unique' | 'index';
    // defaultValue?: FieldDefaultValue<string>;
  };

export const decimal =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    precision = 18,
    scale = 4,
    ...config
  }: DecimalFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if (meta.provider === 'sqlite') {
      throw new Error('The decimal field does not support sqlite');
    }

    if (!Number.isInteger(scale)) {
      throw new Error(
        `The scale for decimal fields must be an integer but the scale for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      );
    }

    if (!Number.isInteger(precision)) {
      throw new Error(
        `The precision for decimal fields must be an integer but the precision for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      );
    }

    if (scale > precision) {
      throw new Error(
        `The scale configured for decimal field at ${meta.listKey}.${meta.fieldKey} (${scale}) ` +
          `must not be larger than the field's precision (${precision})`
      );
    }

    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
    })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].Decimal.optional }) },
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.Decimal }) } : undefined,
        create: { arg: types.arg({ type: types.Decimal }) },
        update: { arg: types.arg({ type: types.Decimal }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.Decimal }),
      views: resolveView('decimal/views'),
      getAdminMeta: () => ({
        precision,
        scale,
      }),
    });
  };

// ({
//   type: {
//     type: 'Decimal',
//     implementation: Decimal,
//     adapter: PrismaDecimalInterface,
//   },
//   config,
//   views: resolveView('decimal/views'),
//   getAdminMeta: () => ({
//     precision: config.precision || null,
//     scale: config.scale || null,
//   }),
// });
