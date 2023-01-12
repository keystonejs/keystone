import { list, graphql } from '@keystone-6/core';
import { text, relationship, password, timestamp, select, virtual } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { allowAll } from '@keystone-6/core/access';
import { Lists } from '.keystone/types';

const randomNumber = () => Math.round(Math.random() * 10);

const User: Lists.User = list({
  access: allowAll,
  db: {
    extendPrismaList: model => model.replace('}', '@@schema("Auth")' + '\n}'),
  },
  fields: {
    /** The user's first and last name. */
    name: text({
      validation: { isRequired: true },
      db: {
        // not the best example as you should use db.map for this
        extendPrismaField: list => list + ' @map("RealName")',
      },
    }),
    /** Email is used to log into the system. */
    email: text({
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    password: password({ db: { extendPrismaField: list => list + ' @map("Password")' } }),
    roles: text({}),
    phoneNumbers: relationship({
      ref: 'PhoneNumber.user',
      db: {
        extendPrismaField: field => {
          console.log('Phone Number - User: ', field);
          return field;
        },
      },
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['type', 'value'],
        inlineEdit: { fields: ['type', 'value'] },
        inlineCreate: { fields: ['type', 'value'] },
        linkToItem: true,
      },
    }),
    posts: relationship({
      ref: 'Post.author',
      many: true,
    }),
    randomNumber: virtual({
      field: graphql.field({
        type: graphql.Float,
        resolve() {
          return randomNumber();
        },
      }),
    }),
  },
});

export const lists: Lists = {
  User,
  PhoneNumber: list({
    access: allowAll,
    ui: {
      isHidden: true,
      // parentRelationship: 'user',
    },
    db: {
      extendPrismaList: model => model.replace('}', '@@schema("Content")' + '\n}'),
    },
    fields: {
      label: virtual({
        field: graphql.field({
          type: graphql.String,
          resolve(item) {
            return `${item.type} - ${item.value}`;
          },
        }),
        ui: {
          listView: {
            fieldMode: 'hidden',
          },
          itemView: {
            fieldMode: 'hidden',
          },
        },
      }),
      user: relationship({
        ref: 'User.phoneNumbers',
        many: true,
        db: {
          extendPrismaField: field => {
            console.log('Phone Number: ', field);
            return field;
          },
        },
      }),
      type: select({
        options: [
          { label: 'Home', value: 'home' },
          { label: 'Work', value: 'work' },
          { label: 'Mobile', value: 'mobile' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
        db: {
          extendPrismaField: list => list + ' @map("Type")',
        },
      }),
      value: text({}),
    },
  }),
  Post: list({
    access: allowAll,
    db: {
      extendPrismaList: model => model.replace('\n}', '\n@@schema("Content")' + '\n}'),
    },
    fields: {
      title: text({ access: {} }),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
        validation: {
          isRequired: true,
        },
        defaultValue: 'draft',
      }),
      content: document({
        relationships: {
          mention: {
            label: 'Mention',
            listKey: 'User',
          },
        },
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
        db: {
          extendPrismaField: list => list + ' @map("Content")',
        },
      }),
      publishDate: timestamp(),
      author: relationship({
        db: {
          extendPrismaField: () =>
            `\nauthor User? @relation("Post_author", fields: [authorId], references: [id], onUpdate: Cascade, onDelete: Cascade) 
            authorId String? @map("author")
            
            @@index([authorId])`,
        },
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineCreate: { fields: ['name', 'email'] },
        },
      }),
    },
  }),
};
