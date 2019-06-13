/** @jsx jsx */
import { jsx } from '@emotion/core';
import Editor from './editor';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

let ContentField = ({ field, value, onChange, autoFocus, errors }) => {
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
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
              onChange={onChange}
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
