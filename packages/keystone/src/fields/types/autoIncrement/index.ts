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

export type AutoIncrementFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean | 'unique';
  };

export const autoIncrement =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    isIndexed,
    ...config
  }: AutoIncrementFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      default: { kind: 'autoincrement' },
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        // create
        create: { arg: graphql.arg({ type: graphql.Int }) },
        // update
        update: { arg: graphql.arg({ type: graphql.Int }) },
        // filter
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Int.optional }),
          resolve: filters.resolveCommon,
        },
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Int }) } : undefined,
        // orderBy
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      // read
      output: graphql.field({ type: graphql.Int }),
      views: resolveView('integer/views'),
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
