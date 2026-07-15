import { Field as PasswordField, Cell, controller } from '@keystone-6/core/fields/types/password/views'
import type { FieldProps } from '@keystone-6/core/types'

export { Cell, controller }

function generateSecret() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function Field(props: FieldProps<typeof controller>) {
  const { onChange, value } = props

  const generateApiKeySecret = () => {
    const secret = generateSecret()
    onChange?.({ kind: 'editing', isSet: value.isSet, value: secret, confirm: secret })
  }

  return (
    <div>
      <PasswordField {...props} />
      {onChange && (
        <button type="button" onClick={generateApiKeySecret} style={{ marginTop: 8 }}>
          Roll 
        </button>
      )}
    </div>
  )
}
