import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

// this field is based on the integer field
// but with validation to ensure the value is within an expected range
// and a different input in the Admin UI
// https://github.com/keystonejs/keystone/tree/main/packages/core/src/fields/types/integer

export type StarsFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
    maxStars?: number;
  };

export const stars =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    maxStars = 5,
    ...config
  }: StarsFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta =>
    fieldType({
      // this configures what data is stored in the database
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      // this passes through all of the common configuration like access control and etc.
      ...config,
      hooks: {
        ...config.hooks,
        // We use the `validateInput` hook to ensure that the user doesn't set an out of range value.
        // This hook is the key difference on the backend between the stars field type and the integer field type.
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if (!(val == null || (val >= 0 && val <= maxStars))) {
            args.addValidationError(`The value must be within the range of 0-${maxStars}`);
          }
          await config.hooks?.validateInput?.(args);
        },
      },
      // all of these inputs are optional if they don't make sense for a particular field type
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Int.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.Int }),
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
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      // this
      output: graphql.field({
        type: graphql.Int,
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
    });
