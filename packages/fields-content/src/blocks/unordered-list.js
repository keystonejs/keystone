import { resolveView } from '../resolve-view';
import { Block } from '../Block';
import listItem from './list-item';

export default class UnorderedListBlock extends Block {
  get type() {
    return 'unordered-list';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/unordered-list'), ...new listItem().getAdminViews()];
  }
}
