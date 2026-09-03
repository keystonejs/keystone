import { password as corePassword } from '@keystone-6/core/fields'
import type { BaseListTypeInfo, FieldTypeFunc } from '@keystone-6/core/types'
import type { PasswordFieldConfig } from '@keystone-6/core/fields/types/password'

export function password<ListTypeInfo extends BaseListTypeInfo>(
  config: PasswordFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  return corePassword(config)
}

export function apiKey<ListTypeInfo extends BaseListTypeInfo>(
  config: PasswordFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const field = corePassword(config)

  return meta => ({
    ...field(meta),
    views: './api-key-field/views',
  })
}
