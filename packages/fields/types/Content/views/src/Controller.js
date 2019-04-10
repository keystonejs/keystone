// TODO: This is a bit of a mess, and won't work when we split Content
// out into its own package. But the build process doesn't understand
// how to traverse preconstruct's src pointers yet, when it does this
// should import from '@keystone-alpha/fields/types/Text/views/Controller'
import memoizeOne from 'memoize-one';
import TextController from '../../../Text/views/Controller/Controller';
import * as paragraph from './editor/blocks/paragraph';

const DEFAULT_BLOCKS = [paragraph];

const flattenBlocks = (inputBlocks, outputObj = {}) =>
  inputBlocks.reduce((outputBlocks, block) => {
    if (outputBlocks[block.type]) {
      // check the referential equality of a blocks Node since it has to be
      // defined and if they're equal we know it's the same block
      if (outputBlocks[block.type].Node !== block.Node) {
        throw new Error(`There are two different Content blocks with the type '${block.type}'`);
      } else {
        // This block (and its dependencies) have already been added
        return outputBlocks;
      }
    }

    if (block.Node === undefined) {
      throw new Error(`Unable to load Content block '${block.type}' - no Node component defined`);
    }

    const { dependencies, ...blockToInsert } = block;

    outputBlocks[block.type] = blockToInsert;

    if (dependencies !== undefined) {
      // Recurse on the dependencies
      flattenBlocks(dependencies, outputBlocks);
    }

    return outputBlocks;
  }, outputObj);

export default class ContentController extends TextController {
  constructor(...args) {
    super(...args);

    // Attach this as a memoized member function to avoid two pitfalls;
    // 1. Don't load all the block views up front. Instead, lazily load them
    //    only when requested.
    // 2. Avoid recalculating everything on each request for the Blocks.
    //    Instead, when requested multiple times, use the previously cached
    //    results.
    this.getBlocks = memoizeOne(() => {
      const blocksModules = this.adminMeta.readViews(this.views.blocks);

      let customBlocks = blocksModules.map((block, i) => ({
        ...block,
        options: this.config.blockOptions[i],
      }));

      return flattenBlocks([...DEFAULT_BLOCKS, ...customBlocks]);
    });
  }

  getValue = data => {
    const { path } = this.config;
    if (!data || !data[path] || !data[path].document) {
      // Forcibly return null if empty string
      return { document: null };
    }
    return { document: data[path].document };
  };

  getQueryFragment = () => {
    return `
      ${this.path} {
        document
      }
    `;
  };
}
