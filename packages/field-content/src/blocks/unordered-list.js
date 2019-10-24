import { importView } from '@keystonejs/build-field-types';
import { Block } from '../Block';
import listItem from './list-item';

export default class UnorderedListBlock extends Block {
  get type() {
    return 'unordered-list';
  }
  getAdminViews() {
    return [importView('../views/editor/blocks/unordered-list'), ...new listItem().getAdminViews()];
  }
}
