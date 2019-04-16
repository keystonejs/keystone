import { importView } from '@keystone-alpha/build-field-types';
import paragraph from './paragraph';

export default {
  type: 'heading',
  viewPath: importView('../views/editor/blocks/heading'),
  dependencies: [paragraph],
};
