import { importView } from '@keystone-alpha/build-field-types';
import listItem from './list-item';

export default {
  type: 'unordered-list',
  viewPath: importView('../views/editor/blocks/unordered-list'),
  dependencies: [listItem],
};
