import * as embed from './block-types/embed';
import * as image from './block-types/image';
import * as link from './block-types/link';
import * as heading from './block-types/heading';
import * as blockquote from './block-types/blockquote';
import * as paragraph from './block-types/paragraph';
import * as orderedList from './block-types/ordered-list';
import * as unorderedList from './block-types/unordered-list';

// implicitly a dependency of all other blocks.
// these blocks have to be included
let defaultBlocks = [paragraph];

let finalBlocks = [
  ...defaultBlocks,
  image,
  heading,
  blockquote,
  orderedList,
  unorderedList,
  link,
  embed,
];

let flatBlocks = [];

function pushBlocks(blocks) {
  blocks.forEach(block => {
    let item = flatBlocks.find(({ type }) => type === block.type);
    if (item === undefined) {
      let { dependencies, ...blockToInsert } = block;
      flatBlocks.push(blockToInsert);
      if (dependencies !== undefined) {
        pushBlocks(dependencies);
      }
    } else if (item.renderNode === undefined) {
      throw new Error(item.type + 'does not have a renderNode function defined');
    }
    // check the referential equality of renderNode since it has to be defined
    // and if they're equal we know it's the same block
    else if (item.renderNode !== block.renderNode) {
      throw new Error('There are two different blocks with the type:' + block.type);
    }
  });
}

pushBlocks(finalBlocks);

export let blocks = {};

flatBlocks.forEach(block => {
  blocks[block.type] = block;
});

export let blockPlugins = [
  {
    renderNode(props, editor) {
      let block = blocks[props.node.type];
      if (block) {
        return block.renderNode(props, editor);
      }
      // we don't want to define how how nodes are rendered in any other place
      throw new Error('Cannot render node of type: ' + props.node.type);
    },
  },
];

Object.keys(blocks).forEach(type => {
  let plugins = blocks[type].plugins;
  if (plugins !== undefined) {
    blockPlugins.push(...plugins);
  }
});
