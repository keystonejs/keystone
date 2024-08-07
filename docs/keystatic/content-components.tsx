import { fields } from '@keystatic/core'
import { inline, wrapper } from '@keystatic/core/content-components'
import { megaphoneIcon } from '@keystar/ui/icon/icons/megaphoneIcon'
import { smileIcon } from '@keystar/ui/icon/icons/smileIcon'

type Label = string

export function hint (label: Label = 'Hint') {
  return wrapper({
    label: label,
    icon: megaphoneIcon,
    schema: {
      kind: fields.select({
        label: 'Kind',
        options: [
          { label: 'Tip', value: 'tip' },
          { label: 'Warning', value: 'warn' },
          { label: 'Error', value: 'error' },
        ],
        defaultValue: 'tip',
      }),
    },
  })
}

export function emoji (label: Label = 'Emoji') {
  return inline({
    label: label,
    icon: smileIcon,
    schema: {
      symbol: fields.text({ label: 'Symbol' }),
      alt: fields.text({ label: 'Alt' }),
    },
  })
}
