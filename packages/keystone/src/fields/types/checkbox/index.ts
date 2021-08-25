import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  graphql,
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
          arg: graphql.arg({ type: filters[meta.provider].Boolean.optional }),
          resolve: filters.resolveCommon,
        },
        create: { arg: graphql.arg({ type: graphql.Boolean }) },
        update: { arg: graphql.arg({ type: graphql.Boolean }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.Boolean,
      }),
      views: resolveView('checkbox/views'),
      __legacy: { isRequired, defaultValue },
    });
  };
