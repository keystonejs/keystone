import { Flex } from '@keystar/ui/layout'
import { useMemo } from 'react'
import type { GenericPreviewProps, ConditionalField, BasicFormField, ComponentSchema } from '../../api'
import type {
  ExtraFieldInputProps} from '../../form-from-preview';
import {
  InnerFormValueContentFromPreviewProps,
} from '../../form-from-preview'
import { AddToPathProvider } from '../text/path-context'

export function ConditionalFieldInput<
  DiscriminantField extends BasicFormField<string | boolean>,
  ConditionalValues extends {
    [Key in `${ReturnType<DiscriminantField['defaultValue']>}`]: ComponentSchema
  },
>({
  schema,
  autoFocus,
  discriminant,
  onChange,
  value,
  forceValidation,
  omitFieldAtPath,
}: GenericPreviewProps<ConditionalField<DiscriminantField, ConditionalValues>, unknown> &
  ExtraFieldInputProps) {
  const schemaDiscriminant = schema.discriminant as BasicFormField<string | boolean>
  const innerOmitFieldAtPath = useMemo(() => {
    if (!omitFieldAtPath) {
      return undefined
    }
    return omitFieldAtPath.slice(1)
  }, [omitFieldAtPath])
  return (
    <Flex gap="xlarge" direction="column">
      {useMemo(
        () => (
          <AddToPathProvider part="discriminant">
            <schemaDiscriminant.Input
              autoFocus={!!autoFocus}
              value={discriminant}
              onChange={onChange}
              forceValidation={forceValidation}
            />
          </AddToPathProvider>
        ),
        [autoFocus, schemaDiscriminant, discriminant, onChange, forceValidation]
      )}
      <AddToPathProvider part="value">
        <InnerFormValueContentFromPreviewProps
          forceValidation={forceValidation}
          {...value}
          {...(omitFieldAtPath?.[0] === 'value' ? { omitFieldAtPath: innerOmitFieldAtPath } : {})}
        />
      </AddToPathProvider>
    </Flex>
  )
}
