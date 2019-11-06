import { importView } from '@keystonejs/build-field-types';
import { Block } from '../Block';

export default class ParagraphBlock extends Block {
  get type() {
    return 'paragraph';
  }
  getAdminViews() {
    return [importView('../views/editor/blocks/paragraph')];
  }
}
