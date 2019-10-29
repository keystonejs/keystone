import { importView } from '@keystonejs/build-field-types';
import { Block } from '../Block';

export default class ListItemBlock extends Block {
  get type() {
    return 'list-item';
  }
  getAdminViews() {
    return [importView('../views/editor/blocks/list-item')];
  }
}
