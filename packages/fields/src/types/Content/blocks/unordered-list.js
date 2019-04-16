import path from 'path';
import listItem from './list-item';

export default {
  type: 'unordered-list',
  viewPath: path.join(__dirname, '../views/blocks/unordered-list'),
  dependencies: [listItem],
};
