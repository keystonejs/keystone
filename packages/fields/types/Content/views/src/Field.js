/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import * as paragraph from './editor/blocks/paragraph';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

let ContentField = ({ field, value: serverValue, onChange, autoFocus }) => {
  const blocksModules = field.adminMeta.readViews(field.views.blocks);
  let blocks = useMemo(() => {
    let defaultBlocks = [paragraph];

    let customBlocks = blocksModules.map((block, i) => ({
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
  }, [blocksModules]);

  let parsedValue;
  if (serverValue && serverValue.document) {
    try {
      parsedValue = JSON.parse(serverValue.document);
    } catch (error) {
      console.error('Unable to parse Content field document: ', error);
      console.error('Received: ' + serverValue.toString().slice(0, 100));
      parsedValue = initialValue;
    }
  } else {
    parsedValue = initialValue;
  }

  let [value, setValue] = useState(() => Value.fromJSON(parsedValue));

  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer
      onBlur={() => {
        let stringified = JSON.stringify(value.toJS());
        if (stringified !== serverValue.document) {
          onChange({ document: stringified });
        }
      }}
    >
      <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
      <FieldInput>
        {Object.values(blocks)
          .filter(({ Provider, options }) => Provider && options)
          .reduce(
            (children, { Provider, options }) => (
              <Provider value={options}>{children}</Provider>
            ),
            <Editor
              blocks={blocks}
              value={value}
              onChange={setValue}
              autoFocus={autoFocus}
              id={htmlID}
              css={inputStyles({ isMultiline: true })}
            />
          )}
      </FieldInput>
    </FieldContainer>
  );
};

export default ContentField;
