/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  embedType,
  imageType,
  defaultType,
  blockquoteType,
  listItemType,
  orderedListType,
  unorderedListType,
  linkType,
  headingType,
  captionType,
} from '../constants';
import * as embed from './embed';
import * as image from './image';
import * as link from './link';

export let blocks = {
  [embedType]: embed,
  [imageType]: image,
  [defaultType]: {
    renderNode({ attributes, children }) {
      return <p {...attributes}>{children}</p>;
    },
  },
  [blockquoteType]: {
    renderNode({ attributes, children }) {
      return (
        <blockquote
          {...attributes}
          css={{
            borderLeft: '4px solid #eee',
            color: '#666',
            fontStyle: 'italic',
            margin: 0,
            marginBottom: '1em',
            paddingLeft: '1em',
          }}
        >
          {children}
        </blockquote>
      );
    },
  },
  // technically link isn't a block, it's an inline but it's easier to have it here
  [linkType]: link,
  [unorderedListType]: {
    renderNode({ attributes, children }) {
      return <ul {...attributes}>{children}</ul>;
    },
  },
  [orderedListType]: {
    renderNode({ attributes, children }) {
      return <ol {...attributes}>{children}</ol>;
    },
  },
  [listItemType]: {
    renderNode({ attributes, children }) {
      return <li {...attributes}>{children}</li>;
    },
  },
  [headingType]: {
    renderNode({ attributes, children }) {
      return <h2 {...attributes}>{children}</h2>;
    },
  },
  [captionType]: {
    renderNode({ attributes, children }) {
      // TODO: add a figure around the Image
      return (
        <figcaption css={{ padding: 8, textAlign: 'center' }} {...attributes}>
          {children}
        </figcaption>
      );
    },
  },
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
