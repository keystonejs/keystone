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
      // this configures what data is stored in the database
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      // this passes through all of the common configuration like hooks, access control, etc.
      ...config,
      // all of these inputs are optional if they don't make sense for a particular field type
      input: {
        create: {
          arg: schema.arg({ type: schema.Int }),
          // this field type doesn't need to do anything special
          // but field types can specify resolvers for inputs like they can for their output GraphQL field
          // this function can be omitted, it is here purely to show how you could change it
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(val, context) {
            // if it's null, then the value will be set to null in the database
            if (val === null) {
              return null;
            }
            // if it's undefined(which means that it was omitted in the request)
            // returning undefined will mean "don't change the existing value"
            // note that this means that this function is called on every update to an item
            // including when the field is not updated
            if (val === undefined) {
              return undefined;
            }
            // if it's not null or undefined, it must be a number
            return val;
          },
        },
        update: { arg: schema.arg({ type: schema.Int }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      // this
      output: schema.field({
        type: schema.Int,
        // like the input resolvers, providing the resolver is unnecessary if you're just returning the value
        // it is shown here to show what you could do
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve({ value, item }, args, context, info) {
          return value;
        },
      }),
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
