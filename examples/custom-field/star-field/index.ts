import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  schema,
} from '@keystone-next/types';

export type StarsFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isUnique?: boolean;
    isIndexed?: boolean;
    maxStars?: number;
  };

export const stars =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    maxStars = 5,
    ...config
  }: StarsFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        create: { arg: schema.arg({ type: schema.Int }) },
        update: { arg: schema.arg({ type: schema.Int }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.Int }),
      views: require.resolve('./views'),
      getAdminMeta() {
        return { maxStars };
      },
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.Int),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.Int),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.Int),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
        isRequired,
        defaultValue,
      },
    });

function getIndexType({
  isIndexed,
  isUnique,
}: {
  isIndexed?: boolean;
  isUnique?: boolean;
}): undefined | 'index' | 'unique' {
  if (isUnique && isIndexed) {
    throw new Error('Only one of isUnique and isIndexed can be passed to field types');
  }
  return isIndexed ? 'index' : isUnique ? 'unique' : undefined;
}
