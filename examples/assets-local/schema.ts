import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, image, file } from '@keystone-6/core/fields';

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({ storage: 'my_images' }),
      attachment: file({ storage: 'my_files' }),
    },
  }),
};
