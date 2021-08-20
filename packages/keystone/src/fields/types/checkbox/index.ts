import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  schema,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<boolean, TGeneratedListTypes>;
    isRequired?: boolean;
  };

export const checkbox =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: CheckboxFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type checkbox');
    }

    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Boolean' })({
      ...config,
      input: {
        where: {
          arg: schema.arg({ type: filters[meta.provider].Boolean.optional }),
          resolve: filters.resolveCommon,
        },
        create: { arg: schema.arg({ type: schema.Boolean }) },
        update: { arg: schema.arg({ type: schema.Boolean }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.Boolean,
      }),
      views: resolveView('checkbox/views'),
      __legacy: { isRequired, defaultValue },
    });
  };
