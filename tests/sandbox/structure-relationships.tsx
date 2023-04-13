import {
  ArrayField,
  ComponentSchemaForGraphQL,
  fields,
} from '@keystone-6/fields-document/component-blocks';

export const schema: ArrayField<ComponentSchemaForGraphQL> = fields.array(
  fields.relationship({
    label: 'My things',
    listKey: 'Thing',
    many: false,
  }),
  {
    label: props => {
      return `${props.value?.label}`;
    },
  }
);
