import { list, graphql, config, group } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
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
  bigInt,
  calendarDay,
  multiselect,
} from '@keystone-6/core/fields';
import { document, structure } from '@keystone-6/fields-document';
import { componentBlocks } from '../component-blocks';
import { schema as structureSchema } from '../structure';
import { schema as structureNestedSchema } from '../structure-nested';
import { schema as structureRelationshipsSchema } from '../structure-relationships';
import { dbConfig, localStorageConfig, trackingFields, uiConfig } from '../utils';

const description =
  'Some thing to describe to test the length of the text for width, blah blah blah blah blah blah blah blah blah';

export const lists = {
  Thing: list({
    access: allowAll,
    fields: {
      text: text({ ui: { description } }),
      timestamp: timestamp({ ui: { description } }),
      structure: structure({ schema: structureSchema, ui: { views: './structure' } }),
      structureNested: structure({
        schema: structureNestedSchema,
        ui: { views: './structure-nested' },
      }),
      structureRelationships: structure({
        schema: structureRelationshipsSchema,
        ui: { views: './structure-relationships' },
      }),
      ...group({
        label: 'Some group',
        description: 'Some group description',
        fields: {
          checkbox: checkbox({ ui: { description } }),
          password: password({ ui: { description } }),
          toOneRelationship: relationship({ ref: 'User', ui: { description } }),
        },
      }),
      toOneRelationshipAlternateLabel: relationship({
        ref: 'User',
        ui: {
          description,
          labelField: 'email',
          searchFields: ['email', 'name'],
        },
      }),
      toManyRelationship: relationship({ ref: 'Todo', many: true, ui: { description } }),
      toOneRelationshipCard: relationship({
        ref: 'User',
        ui: {
          description,
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineConnect: {
            labelField: 'email',
          },
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
      calendarDay: calendarDay({ ui: { description } }),
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
      selectOnSide: select({
        ui: {
          description,
          itemView: {
            fieldPosition: 'sidebar',
          },
        },
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' },
        ],
      }),
      selectOnSideItemViewOnly: select({
        ui: {
          description,
          createView: {
            fieldMode: 'hidden',
          },
          itemView: {
            fieldPosition: 'sidebar',
          },
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
        ui: { displayMode: 'segmented-control', description },
      }),
      multiselect: multiselect({
        ui: { description },
        options: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' },
        ],
      }),
      json: json({ ui: { description } }),
      integer: integer({ ui: { description } }),
      bigInt: bigInt({ ui: { description } }),
      float: float({ ui: { description } }),
      image: image({ ui: { description }, storage: 'images' }),
      file: file({ ui: { description }, storage: 'files' }),
      document: document({
        ui: { views: './component-blocks' },
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
    ui: {
      labelField: 'text',
    },
  }),
  Todo: list({
    access: allowAll,
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
    access: allowAll,
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
  Settings: list({
    isSingleton: true,
    access: allowAll,
    fields: {
      websiteName: text(),
      copyrightText: text(),
    },
    graphql: {
      plural: 'ManySettings',
    },
  }),
};

export default config({
  db: dbConfig,
  ui: uiConfig,
  storage: localStorageConfig,
  lists,
});
