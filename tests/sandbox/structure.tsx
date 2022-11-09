import {
  ArrayField,
  ComponentSchemaForGraphQL,
  fields,
} from '@keystone-6/fields-document/component-blocks';

export const schema: ArrayField<ComponentSchemaForGraphQL> = fields.array(
  fields.integer({ label: 'My integer units' }),
  {
    label: props => {
      return `${props.value} units`;
    },
  }
);
