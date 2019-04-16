/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

let ContentField = ({ field, value: serverValue, onChange, autoFocus }) => {
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
        {Object.values(field.getBlocks())
          .filter(({ Provider, options }) => Provider && options)
          .reduce(
            (children, { Provider, options }) => (
              <Provider value={options}>{children}</Provider>
            ),
            <Editor
              blocks={field.getBlocks()}
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
