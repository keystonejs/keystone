import { importView } from '@keystone-alpha/build-field-types';
import listItem from './list-item';

export default {
  type: 'ordered-list',
  viewPath: importView('../views/editor/blocks/ordered-list'),
  dependencies: [listItem],
};
