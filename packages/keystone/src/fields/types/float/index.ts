import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  graphql,
  orderDirectionEnum,
  FieldDefaultValue,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
  };

export const float =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Float',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Float.optional }),
          resolve: filters.resolveCommon,
        },
        create: { arg: graphql.arg({ type: graphql.Float }) },
        update: { arg: graphql.arg({ type: graphql.Float }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Float }),
      views: resolveView('float/views'),
      __legacy: { isRequired, defaultValue },
    });
