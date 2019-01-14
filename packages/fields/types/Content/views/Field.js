/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import FieldTypes from './FIELD_TYPES';
import * as paragraph from './editor/blocks/paragraph';
import { Content } from './editor/renderer';

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
          } else if (existingItem.Node === undefined) {
            throw new Error(existingItem.type + 'does not have a Node component defined');
          }
          // check the referential equality of a blocks Node since it has to be defined
          // and if they're equal we know it's the same block
          else if (existingItem.Node !== block.Node) {
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

  let serverValue = item[field.path];
  let parsedValue;
  if (serverValue) {
    parsedValue = JSON.parse(serverValue);
  } else {
    parsedValue = initialValue;
  }

  let [value, setValue] = useState(() => Value.fromJS(parsedValue));

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
      <Content value={value} />
    </div>
  );
};

export default ContentField;
