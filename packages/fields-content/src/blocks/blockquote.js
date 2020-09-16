import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class BlockquoteBlock extends Block {
  get type() {
    return 'blockquote';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/blockquote')];
  }
}
