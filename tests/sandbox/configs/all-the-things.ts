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
import { componentBlocks } from '../component-blocks';
import { dbConfig, localStorageConfig, trackingFields } from '../utils';

const description =
  'Some thing to describe to test the length of the text for width, blah blah blah blah blah blah blah blah blah';

export const lists = {
  Thing: list({
    fields: {
      checkbox: checkbox({ ui: { description } }),
      password: password({ ui: { description } }),
      toOneRelationship: relationship({ ui: { description }, ref: 'User' }),
      toManyRelationship: relationship({ ui: { description }, ref: 'Todo', many: true }),
      toOneRelationshipCard: relationship({
        ref: 'User',
        ui: {
          description,
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
          description,
          displayMode: 'cards',
          cardFields: ['label', 'isComplete', 'assignedTo'],
          inlineConnect: true,
          inlineCreate: { fields: ['label', 'isComplete', 'assignedTo'] },
          linkToItem: true,
          inlineEdit: { fields: ['label', 'isComplete', 'assignedTo'] },
        },
        many: true,
      }),
      text: text({ ui: { description } }),
      timestamp: timestamp({ ui: { description } }),
      randomNumberVirtual: virtual({
        ui: { description },
        field: graphql.field({
          type: graphql.Float,
          resolve() {
            return Math.random() * 1000;
          },
        }),
      }),
      select: select({
        ui: { description },
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
        ui: { displayMode: 'segmented-control', description },
      }),
      json: json({ ui: { description } }),
      integer: integer({ ui: { description } }),
      float: float({ ui: { description } }),
      image: image({ ui: { description }, storage: 'images' }),
      file: file({ ui: { description }, storage: 'files' }),
      document: document({
        ui: { description, views: require.resolve('../component-blocks.tsx') },
        relationships: { mention: { label: 'Mention', listKey: 'User' } },
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
        componentBlocks,
      }),
    },
  }),
  Todo: list({
    ui: {
      description,
      listView: { initialColumns: ['label', 'isComplete', 'createdAt', 'updatedAt'] },
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
    ui: { listView: { initialColumns: ['name', 'tasks', 'createdAt', 'updatedAt'] } },
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
