export { ContentController as Controller } from './Controller';
export { ContentField as Field } from './views/Field';
export { Filter } from '@voussoir/admin-view-text';

// TODO: FIXME
export const blocks = {
  blockquote: { viewPath: require.resolve('./views/editor/blocks/blockquote') },
  embed: { viewPath: require.resolve('./views/editor/blocks/embed') },
  heading: { viewPath: require.resolve('./views/editor/blocks/heading') },
  image: { viewPath: require.resolve('./views/editor/blocks/image-container') },
  link: { viewPath: require.resolve('./views/editor/blocks/link') },
  orderedList: { viewPath: require.resolve('./views/editor/blocks/ordered-list') },
  unorderedList: { viewPath: require.resolve('./views/editor/blocks/unordered-list') },
  // not exposing list-item since it's only used internally by the other blocks
  // not exposing paragraph since it's included by default
};
