/** @jsxRuntime classic */
/** @jsx jsx */

import { fields } from '@keystone-6/fields-document/component-blocks';

export const prop = fields.array(
  fields.object({
    a: fields.text({ label: 'Blah A' }),
    b: fields.text({ label: 'Blah B' }),
  })
);
