import { list, graphql, config } from '@keystone-6/core';
import {
  checkbox,
  password,
  relationship,
  text,
  timestamp,
  file,
  virtual,
  select,
  json,
  integer,
  image,
  float,
} from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { dbConfig, localStorageConfig, trackingFields } from '../utils';

export const lists = {
  Thing: list({
    fields: {
      checkbox: checkbox({
        defaultValue: false,
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      password: password({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      toOneRelationship: relationship({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        ref: 'User',
      }),
      toManyRelationship: relationship({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        ref: 'Todo',
        many: true,
      }),
      toOneRelationshipCard: relationship({
        ref: 'User',
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineConnect: true,
          inlineCreate: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineEdit: { fields: ['name', 'email'] },
        },
      }),
      toManyRelationshipCard: relationship({
        ref: 'Todo',
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
          displayMode: 'cards',
          cardFields: ['label', 'isComplete', 'assignedTo'],
          inlineConnect: true,
          inlineCreate: { fields: ['label', 'isComplete', 'assignedTo'] },
          linkToItem: true,
          inlineEdit: { fields: ['label', 'isComplete', 'assignedTo'] },
        },
        many: true,
      }),
      text: text({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      timestamp: timestamp({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      randomNumberVirtual: virtual({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        field: graphql.field({
          type: graphql.Float,
          resolve() {
            return Math.random() * 1000;
          },
        }),
      }),
      select: select({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' },
        ],
      }),
      selectSegmentedControl: select({
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' },
        ],
        ui: {
          displayMode: 'segmented-control',
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      json: json({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      integer: integer({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      float: float({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
      }),
      image: image({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        storage: 'images',
      }),
      file: file({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
        storage: 'files',
      }),
      document: document({
        ui: {
          description:
            'Some thing to describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk hguytyrdrtd jhjg',
        },
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
      }),
    },
  }),
  Todo: list({
    ui: {
      description:
        'some text describe to test the length of the text for width, kjhjkhkjhkhkjhkjhk bjhjh jhkjhkjhk jkhkjhk ',
      listView: {
        initialColumns: ['label', 'isComplete', 'createdAt', 'updatedAt'],
      },
    },
    fields: {
      label: text({ validation: { isRequired: true } }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'User.tasks' }),
      finishBy: timestamp(),
      ...trackingFields,
    },
  }),
  User: list({
    ui: {
      listView: {
        initialColumns: ['name', 'tasks', 'createdAt', 'updatedAt'],
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text(),
      password: password(),
      tasks: relationship({
        ref: 'Todo.assignedTo',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
      ...trackingFields,
    },
  }),
};

export default config({
  db: dbConfig,
  storage: localStorageConfig,
  lists,
});
