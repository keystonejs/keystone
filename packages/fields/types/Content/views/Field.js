/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import FieldTypes from './FIELD_TYPES';
import * as paragraph from './editor/block-types/paragraph';

let ContentField = ({ field, item, onChange }) => {
  const views = FieldTypes[field.list.key][field.path];
  let blocks = useMemo(
    () => {
      let defaultBlocks = [paragraph];

      let customBlocks = [];

      Object.keys(views).forEach(key => {
        let match = key.match(/\$\$block\$\$(\d+)/);
        if (match !== null) {
          customBlocks.push({
            ...views[key],
            options: field.config.blockOptions[Number(match[1])],
          });
        }
      });

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
          } else if (existingItem.renderNode === undefined) {
            throw new Error(existingItem.type + 'does not have a renderNode function defined');
          }
          // check the referential equality of renderNode since it has to be defined
          // and if they're equal we know it's the same block
          else if (existingItem.renderNode !== block.renderNode) {
            throw new Error('There are two different blocks with the type:' + block.type);
          }
        });
      }

      pushBlocks(combinedBlocks);

      return flatBlocks.reduce((obj, block) => {
        obj[block.type] = block;
        return obj;
      }, {});
    },
    [views]
  );

  let parsedValue = item[field.path];
  if (parsedValue) {
    parsedValue = JSON.parse(parsedValue);
  } else {
    parsedValue = initialValue;
  }

  let [value, setValue] = useState(() => Value.fromJS(parsedValue));

  return (
    <div
      onBlur={() => {
        onChange(field, JSON.stringify(value.toJS()));
      }}
    >
      <h1>{field.label}</h1>
      {Object.keys(blocks)
        .map(key => blocks[key])
        .reduce(
          (children, block) => {
            if (block.Provider === undefined || block.options === null) {
              return children;
            }
            return <block.Provider value={block.options}>{children}</block.Provider>;
          },
          <Editor
            blocks={blocks}
            value={value}
            onChange={newValue => {
              setValue(newValue);
            }}
          />
        )}
    </div>
  );
};

export default ContentField;
