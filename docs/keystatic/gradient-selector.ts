import { fields } from '@keystatic/core'

export type Gradient = 'grad1' | 'grad2' | 'grad3' | 'grad4'

export function gradientSelector ({ defaultValue = 'grad1' }: { defaultValue: Gradient }) {
  return fields.select({
    label: 'Gradient',
    description: 'The gradient to use for the group',
    options: [
      { label: '1', value: 'grad1' },
      { label: '2', value: 'grad2' },
      { label: '3', value: 'grad3' },
      { label: '4', value: 'grad4' },
    ],
    defaultValue: defaultValue,
  })
}
