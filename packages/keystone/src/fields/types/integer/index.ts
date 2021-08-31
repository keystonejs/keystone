import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  graphql,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';

export type IntegerFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean | 'unique';
  };

export const integer =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isRequired,
    defaultValue,
    ...config
  }: IntegerFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Int }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Int.optional }),
          resolve: filters.resolveCommon,
        },
        create: { arg: graphql.arg({ type: graphql.Int }) },
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Int }),
      views: resolveView('integer/views'),
      __legacy: { isRequired, defaultValue },
    });
