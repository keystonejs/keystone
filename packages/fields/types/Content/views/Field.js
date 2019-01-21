/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import FieldTypes from './FIELD_TYPES';
import * as paragraph from './editor/blocks/paragraph';

let ContentField = ({ field, item, onChange }) => {
  const views = FieldTypes[field.list.key][field.path];
  let blocks = useMemo(() => {
    let defaultBlocks = [paragraph];

    let customBlocks = views.blocks.map((block, i) => ({
      ...block,
      options: field.config.blockOptions[i],
    }));

    let combinedBlocks = [...defaultBlocks, ...customBlocks];

    let flatBlocks = [];

    function pushBlocks(blocksToPush) {
      blocksToPush.forEach(block => {
        let existingItem = flatBlocks.find(({ type }) => type === block.type);
        if (existingItem === undefined) {
          let { dependencies, ...blockToInsert } = block;
          flatBlocks.push(blockToInsert);
          if (dependencies !== undefined) {
            pushBlocks(dependencies);
          }
        } else if (existingItem.Node === undefined) {
          throw new Error(
            `Unable to load Content block '${existingItem.type}' - no Node component defined`
          );
        }
        // check the referential equality of a blocks Node since it has to be defined
        // and if they're equal we know it's the same block
        else if (existingItem.Node !== block.Node) {
          throw new Error(`There are two different Content blocks with the type '${block.type}'`);
        }
      });
    }

    pushBlocks(combinedBlocks);

    return flatBlocks.reduce((obj, block) => {
      obj[block.type] = block;
      return obj;
    }, {});
  }, [views]);

  let serverValue = item[field.path];
  let parsedValue;
  if (serverValue) {
    parsedValue = JSON.parse(serverValue);
  } else {
    parsedValue = initialValue;
  }

  let [value, setValue] = useState(() => Value.fromJSON(parsedValue));

  return (
    <div
      onBlur={() => {
        let stringified = JSON.stringify(value.toJS());
        if (stringified !== serverValue) {
          onChange(field, stringified);
        }
      }}
    >
      <h1>{field.label}</h1>
      {Object.keys(blocks)
        .map(key => blocks[key])
        .reduce((children, block) => {
          if (block.Provider === undefined || block.options === null) {
            return children;
          }
          return <block.Provider value={block.options}>{children}</block.Provider>;
        }, <Editor blocks={blocks} value={value} onChange={setValue} />)}
    </div>
  );
};

export default ContentField;
