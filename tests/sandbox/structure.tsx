import { fields } from '@keystone-6/fields-document/component-blocks';

export const schema = fields.object({
  integer: fields.integer({ label: 'My integer units' }),
  array: fields.array(fields.integer({ label: 'My integer units' }), {
    fieldLabel: 'My array of integers',
    label: props => {
      return `${props.value} units`;
    },
  }),
});
