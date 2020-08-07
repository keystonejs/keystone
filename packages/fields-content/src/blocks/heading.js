import { resolveView } from '../resolve-view';
import { Block } from '../Block';
import { paragraph } from '../blocks';

export default class HeadingBlock extends Block {
  get type() {
    return 'heading';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/heading'), ...new paragraph().getAdminViews()];
  }
}
