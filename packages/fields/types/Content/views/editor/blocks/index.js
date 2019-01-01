import * as embed from './embed';
import * as image from './image';
import * as link from './link';
import * as heading from './heading';
import * as blockquote from './blockquote';
import * as paragraph from './paragraph';
import * as listItem from './list-item';
import * as orderedList from './ordered-list';
import * as unorderedList from './unordered-list';

export let blocks = {
  [embed.type]: embed,
  [image.type]: image,
  [paragraph.type]: paragraph,
  [blockquote.type]: blockquote,
  // technically link isn't a block, it's an inline but it's easier to have it here
  [link.type]: link,
  [listItem.type]: listItem,
  [heading.type]: heading,
  [orderedList.type]: orderedList,
  [unorderedList.type]: unorderedList,
};

export let blockTypes = Object.keys(blocks);

// making it an array so we can add more in the future
export let blockPlugins = [
  {
    renderNode(props, editor, next) {
      let block = blocks[props.node.type];
      if (block) {
        return block.renderNode(props, editor);
      }
      next();
    },
  },
];

blockTypes.forEach(type => {
  let plugins = blocks[type].plugins;
  if (plugins !== undefined) {
    blockPlugins.push(...plugins);
  }
});
