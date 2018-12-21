/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import { EmbedlyAPIKeyContext } from './editor/blocks/embed';

let TextField = ({ field, item, onChange }) => {
  let parsedValue = item[field.path];
  if (parsedValue) {
    parsedValue = JSON.parse(parsedValue);
  } else {
    parsedValue = initialValue;
  }

  let [value, setValue] = useState(() => Value.fromJS(parsedValue));

  return (
    <EmbedlyAPIKeyContext.Provider value={field.config.embedlyAPIKey}>
      <div
        onBlur={() => {
          onChange(field, JSON.stringify(value.toJS()));
        }}
      >
        <h1>{field.label}</h1>
        <Editor
          value={value}
          onChange={newValue => {
            setValue(newValue);
          }}
        />
      </div>
    </EmbedlyAPIKeyContext.Provider>
  );
};

export default TextField;
