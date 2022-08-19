import { list } from '@keystone-6/core';
import { relationship, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import type { KeystoneConfig } from '@keystone-6/core/types';
import { TypeInfo } from '.keystone/types';

export const lists: KeystoneConfig<TypeInfo>['lists'] = {
  User: list({
    fields: {
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      name: text({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
  Post: list({
    fields: {
      title: text({ validation: { isRequired: true } }),
      slug: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      content: document({
        formatting: true,
        dividers: true,
        links: true,
        // grid layout options
        layouts: [
          [1, 1], // grid layout 1fr 1fr
          [1, 1, 1], // grid layout 1fr 1fr 1fr
        ],
      }),
      publishDate: timestamp({ defaultValue: { kind: 'now' } }),
      author: relationship({ ref: 'User.posts', many: false }),
    },
  }),
};
