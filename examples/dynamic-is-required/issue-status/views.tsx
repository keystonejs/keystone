import { TextField } from '@keystar/ui/text-field'

import type { controller } from '@keystone-6/core/fields/types/checkbox/views'
import type { FieldProps } from '@keystone-6/core/types'

export function Field({ field, value }: FieldProps<typeof controller>) {
  const status = value ? 'Open' : 'Closed'

  return (
    <TextField
      description={field.description}
      label={field.label}
      isReadOnly={true}
      value={status}
    />
  )
}
