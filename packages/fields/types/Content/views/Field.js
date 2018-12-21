/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo } from 'react';
import Editor from './editor';
import { Value } from 'slate';
import { initialValue } from './editor/constants';
import debounce from 'lodash.debounce';

let TextField = ({ field, item, onChange }) => {
  let parsedValue = item[field.path];
  if (parsedValue) {
    parsedValue = JSON.parse(parsedValue);
  } else {
    parsedValue = initialValue;
  }
  let [rawValue, setRawValue] = useState(JSON.stringify(parsedValue));

  let setTheOuterStateThing = newValue => {
    let newRawValue = JSON.stringify(newValue.toJS());
    if (newRawValue !== rawValue) {
      setRawValue(newRawValue);
      onChange(field, newRawValue);
    }
  };

  let [value, setValue] = useState(() => Value.fromJS(parsedValue));

  return (
    <div>
      <h1>{field.label}</h1>
      <Editor
        value={value}
        onChange={newValue => {
          setValue(newValue);
          if (newValue.document !== value.document) {
            setTheOuterStateThing(newValue);
          }
        }}
      />
    </div>
  );
};

export default TextField;
