import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  fieldType,
  schema,
  orderDirectionEnum,
  FieldTypeFunc,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
    isIndexed?: boolean;
    isUnique?: boolean;
    isRequired?: boolean;
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
  };

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'String',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        uniqueWhere: isUnique ? { arg: schema.arg({ type: schema.String }) } : undefined,
        where: {
          arg: schema.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveString,
        },
        create: { arg: schema.arg({ type: schema.String }) },
        update: { arg: schema.arg({ type: schema.String }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.String }),
      views: resolveView('text/views'),
      getAdminMeta() {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
        };
      },
      __legacy: { defaultValue, isRequired },
    });
