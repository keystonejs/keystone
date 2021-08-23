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
import { getIndexType } from '../../get-index-type';

export type AutoIncrementFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
  };

export const autoIncrement =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    isIndexed,
    isUnique,
    ...config
  }: AutoIncrementFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      default: { kind: 'autoincrement' },
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({
            type: filters[meta.provider].Int.optional,
          }),
          resolve: filters.resolveCommon,
        },
        uniqueWhere: isUnique ? { arg: graphql.arg({ type: graphql.Int }) } : undefined,
        create: { arg: graphql.arg({ type: graphql.Int }) },
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Int }),
      views: resolveView('integer/views'),
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
