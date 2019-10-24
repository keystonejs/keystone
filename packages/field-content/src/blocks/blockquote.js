import { importView } from '@keystonejs/build-field-types';
import { Block } from '../Block';

export default class BlockquoteBlock extends Block {
  get type() {
    return 'blockquote';
  }
  getAdminViews() {
    return [importView('../views/editor/blocks/blockquote')];
  }
}
