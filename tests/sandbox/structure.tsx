import { fields } from '@keystone-6/fields-document/component-blocks'

export const schema = fields.object({
  integer: fields.integer({ label: 'My integer units' }),
  array: fields.array(fields.integer({ label: 'My integer units' }), {
    label: 'My array of integers',
    itemLabel: props => {
      return `${props.value} units`
    },
  }),
})
