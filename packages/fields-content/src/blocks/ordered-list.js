import { resolveView } from '../resolve-view';
import { Block } from '../Block';
import listItem from './list-item';

export default class OrderedListBlock extends Block {
  get type() {
    return 'ordered-list';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/ordered-list'), ...new listItem().getAdminViews()];
  }
}
