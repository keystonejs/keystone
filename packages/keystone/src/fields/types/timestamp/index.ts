import {
  BaseGeneratedListTypes,
  fieldType,
  graphql,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  FieldDefaultValue,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isIndexed?: boolean;
    isUnique?: boolean;
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
  };

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: TimestampFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const inputResolver = (value: string | null | undefined) => {
      if (value === null || value === undefined) {
        return value;
      }
      return new Date(value);
    };
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'DateTime',
      index: getIndexType({ isUnique, isIndexed }),
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].DateTime.optional }),
          resolve: filters.resolveCommon,
        },
        create: { arg: graphql.arg({ type: graphql.String }), resolve: inputResolver },
        update: { arg: graphql.arg({ type: graphql.String }), resolve: inputResolver },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toISOString();
        },
      }),
      views: resolveView('timestamp/views'),
      __legacy: { isRequired, defaultValue },
    });
  };
