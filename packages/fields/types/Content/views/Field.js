/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo, useCallback } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import FieldTypes from './FIELD_TYPES';
import * as paragraph from './editor/blocks/paragraph';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

const editorSyles = inputStyles({ isMultiline: true });

let ContentField = ({ field, item, onChange, autoFocus }) => {
  let blocks = useMemo(
    () => {
      let defaultBlocks = [paragraph];

      let customBlocks = FieldTypes[field.list.key][field.path].blocks.map((block, i) => ({
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
    },
    [field.list.key, field.path]
  );

  const [value, setValue] = useState(() =>
    Value.fromJSON(item[field.path] ? JSON.parse(item[field.path]) : initialValue)
  );

  const htmlID = `ks-input-${field.path}`;

  const saveDraft = useCallback(
    draft => {
      const contentChanged = value.document !== draft.value.document;
      // Always reflect the latest state internally
      setValue(draft.value);
      // And if the data has changed, we send the change event for that
      if (contentChanged) {
        // We purposely only stringify when the content has changed, _and_ when
        // the data is saved to avoid doing extra work when the user is only
        // changing the selection, etc.
        onChange(field, () => JSON.stringify(draft.value.toJS()));
      }
    },
    [field.path, setValue, onChange]
  );

  return (
    <FieldContainer>
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
              onChange={saveDraft}
              autoFocus={autoFocus}
              id={htmlID}
              css={editorSyles}
            />
          )}
      </FieldInput>
    </FieldContainer>
  );
};

export default ContentField;
