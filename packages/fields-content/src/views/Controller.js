import memoizeOne from 'memoize-one';
import isPromise from 'p-is-promise';
import { captureSuspensePromises } from '@keystonejs/utils';
import { Value } from 'slate';
import Controller from '@keystonejs/fields/Controller';

import { serialize, deserialize } from '../slate-serializer';
import { initialValue } from './editor/constants';

const flattenBlocks = inputBlocks =>
  inputBlocks.reduce((outputBlocks, block) => {
    if (!block.type) {
      // Some blocks may pull in other views which aren't themselves blocks, so
      // we ignore them here
      return outputBlocks;
    }

    // NOTE: It's enough to check just the type here as we've already flattened
    // and deduped dependencies during build.
    if (outputBlocks[block.type]) {
      throw new Error(
        `Encountered more than one Content block with type of '${block.type}'. Content blocks must have globally unique types.`
      );
    }

    if (block.Node === undefined) {
      throw new Error(`Unable to load Content block '${block.type}': no 'Node' export found.`);
    }

    outputBlocks[block.type] = block;

    return outputBlocks;
  }, {});

export default class ContentController extends Controller {
  constructor({ defaultValue = Value.fromJSON(initialValue), ...config }, ...args) {
    super({ ...config, defaultValue }, ...args);

    // Attach this as a memoized member function to avoid two pitfalls;
    // 1. Don't load all the block views up front. Instead, lazily load them
    //    only when requested.
    // 2. Avoid recalculating everything on each request for the Blocks.
    //    Instead, when requested multiple times, use the previously cached
    //    results.
    // NOTE: This function is designed to work with React Suspense, so may throw
    // a Promise the first time it is called.
    this.getBlocks = memoizeOne(() => {
      // Loads all configured blocks and their dependencies
      const blocksModules = this.readViews(this.views.blocks);

      const customBlocks = blocksModules.map(block => ({
        ...block,
        options: {
          ...this.config.blockOptions[block.type],
          readViews: this.readViews,
        },
        // This block exists because it was passed into the Content field
        // directly.
        // Dependencies are not allowed to show UI chrome (toolbar/sidebar) unless
        // they're also directly passed to the Content Field.
        withChrome: this.config.blockTypes.includes(block.type),
      }));

      return flattenBlocks(customBlocks);
    });
  }

  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return { [key]: value };
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };
  getFilterTypes = () => [
    {
      type: 'contains',
      label: 'Contains',
      getInitialValue: () => '',
    },
    {
      type: 'not_contains',
      label: 'Does not contain',
      getInitialValue: () => '',
    },
  ];

  getBlocksSync = () => {
    // May return synchronously, or may throw with either an actual error or a
    // loading promise. We should never see a Promise thrown as .serialize()
    // only gets called during event handlers on the client _after_ all the
    // React Suspense calls are fully resolved. We want the
    // returns-synchronously case. Otherwise, we want to either rethrow any
    // error thrown, or throw a new error indicating an unexpected Promise was
    // thrown.
    try {
      return this.getBlocks();
    } catch (loadingPromiseOrError) {
      if (isPromise(loadingPromiseOrError)) {
        // `.getBlocks()` thinks it's in React Suspense mode, which we can't
        // handle here, so we throw a new error.
        throw new Error(
          '`Content#getBlocks()` threw a Promise. This may occur when calling `Content#(de)serialize()` before blocks have had a chance to fully load.'
        );
      }

      // An actual error occurred
      throw loadingPromiseOrError;
    }
  };

  serialize = data => {
    const { path } = this;
    if (!data[path] || !data[path].document) {
      // Forcibly return null if empty string
      return { document: null };
    }

    const blocks = this.getBlocksSync();

    const serializedDocument = serialize(data[path], blocks);

    // TODO: Make this a JSON type in GraphQL so we don't have to stringify it.
    serializedDocument.document = JSON.stringify(serializedDocument.document);

    return {
      disconnectAll: true,
      create: serializedDocument,
    };
  };

  deserialize = data => {
    const { path } = this;
    if (!data[path] || !data[path].document) {
      // Forcibly return a default value if nothing set
      return Value.fromJSON(initialValue);
    }

    const blocks = this.getBlocksSync();

    // TODO: Make the .document a JSON type in GraphQL so we don't have to parse
    // it
    const parsedData = {
      ...data[path],
      document: JSON.parse(data[path].document),
    };

    // Filter out oEmbeds from parsedData.document that missing from parsedData.oEmbeds
    parsedData.document.nodes = parsedData.document.nodes.filter(node => {
      if (node.type !== 'oEmbed') {
        return true;
      }

      if (!node.data || !node.data._joinIds || !node.data._joinIds.length) {
        return false;
      }

      return parsedData.oEmbeds.find(embed => embed.id === node.data._joinIds[0]);
    });

    return deserialize(parsedData, blocks);
  };

  getQueryFragment = () => `
    ${this.path} {
      document
      ${Object.values(this.config.blockOptions)
        .map(({ query }) => query)
        .filter(Boolean)
        .join('\n')}
    }
  `;

  // NOTE: We can't use `super()` below because of some weirdness that Babel is
  // introducing (a bug perhaps?). Instead, I had to copy+pasta the base
  // implementation here.
  initFieldView = () => {
    captureSuspensePromises([
      () => {
        const { Field } = this.views;
        if (Field) {
          this.readViews([Field]);
        }
      },
      () => this.getBlocks(),
    ]);
  };

  initCellView = () => {
    captureSuspensePromises([
      () => {
        const { Cell } = this.views;
        if (Cell) {
          this.readViews([Cell]);
        }
      },
      () => this.getBlocks(),
    ]);
  };

  initFilterView = () => {
    captureSuspensePromises([
      () => {
        const { Filter } = this.views;
        if (Filter) {
          this.readViews([Filter]);
        }
      },
      () => this.getBlocks(),
    ]);
  };
}
