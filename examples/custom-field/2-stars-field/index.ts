import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'

// this field is based on the integer field
// but with validation to ensure the value is within an expected range
// and a different input in the Admin UI
// https://github.com/keystonejs/keystone/tree/main/packages/core/src/fields/types/integer

type StarsFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<ListTypeInfo> & {
  isIndexed?: boolean | 'unique'
  maxStars?: number
}

export function stars <ListTypeInfo extends BaseListTypeInfo> ({
  isIndexed,
  maxStars = 5,
  ...config
}: StarsFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const validateCreate = typeof config.hooks?.validate === 'function' ? config.hooks.validate : config.hooks?.validate?.create
  const validateUpdate = typeof config.hooks?.validate === 'function' ? config.hooks.validate : config.hooks?.validate?.update

  function validate (v: unknown) {
    if (v === null) return
    if (v >= 0 && <= maxStars) return
    return `The value must be within the range of 0-${maxStars}`
  }

  return meta =>
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
        // We use the `validate` hooks to ensure that the user doesn't set an out of range value.
        // This hook is the key difference on the backend between the stars field type and the integer field type.
        validate: {
          ...config.hooks?.validate,
          async create (args) {
            const err = validate(args.resolvedData[meta.fieldKey])
            if (err) args.addValidationError(err)
            await validateCreate?.(args)
          },
          async update (args) {
            const err = validate(args.resolvedData[meta.fieldKey])
            if (err) args.addValidationError(err)
            await validateUpdate?.(args)
          }
        }        
      },
      // all of these inputs are optional if they don't make sense for a particular field type
      input: {
        create: {
          arg: g.arg({ type: g.Int }),
          // this field type doesn't need to do anything special
          // but field types can specify resolvers for inputs like they can for their output GraphQL field
          // this function can be omitted, it is here purely to show how you could change it
          resolve (val, context) {
            // if it's null, then the value will be set to null in the database
            if (val === null) return null
            // if it's undefined(which means that it was omitted in the request)
            // returning undefined will mean "don't change the existing value"
            // note that this means that this function is called on every update to an item
            // including when the field is not updated
            if (val === undefined) return undefined
            // if it's not null or undefined, it must be a number
            return val
          },
        },
        update: { arg: g.arg({ type: g.Int }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({
        type: g.Int,
        // like the input resolvers, providing the resolver is unnecessary if you're just returning the value
        // it is shown here to show what you could do
        resolve ({ value, item }, args, context, info) {
          return value
        },
      }),
      views: './2-stars-field/views',
      getAdminMeta () {
        return { maxStars }
      },
    })
}
