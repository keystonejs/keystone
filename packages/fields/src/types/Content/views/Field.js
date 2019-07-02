/** @jsx jsx */
import { jsx } from '@emotion/core';
import Editor from './editor';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

let ContentField = ({ field, value, onChange, autoFocus, errors }) => {
  const htmlID = `ks-content-editor-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        {Object.values(field.getBlocks())
          .filter(({ Provider, options }) => Provider && options)
          .reduce(
            (children, { Provider, options }, index) => (
              // Using index within key is ok here as the blocks never change
              // across renders
              <Provider value={options} key={`${htmlID}-provider-${index}`}>
                {children}
              </Provider>
            ),
            <Editor
              key={htmlID}
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
