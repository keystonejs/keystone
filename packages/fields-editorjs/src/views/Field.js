/** @jsx jsx */

import { jsx } from '@emotion/core';
import EditorJs from 'react-editor-js';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import { gridSize, colors, borderRadius } from '@arch-ui/theme';

import { EDITOR_JS_TOOLS } from './tools';

const EditorJsField = ({ onChange, field, errors, value: serverValue }) => {
  const handleChange = value => {
    onChange(value);
  };

  // const value = serverValue || {blocks:[]};
  const value = serverValue || { blocks: [] };
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  if (accessError) return null;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <div
        css={{
          border: `1px ${colors.N20} solid`,
          borderRadius,
          padding: `${gridSize}px`,
        }}
      >
        <EditorJs
          data={value}
          tools={EDITOR_JS_TOOLS}
          onChange={async e => {
            handleChange(await e.saver.save());
          }}
          css={{
            display: 'flex',
            padding: `${gridSize}px 0`,
            borderBottom: `1px solid ${colors.N10}`,
            marginBottom: `${gridSize}px`,
          }}
        />
      </div>
    </FieldContainer>
  );
};

export default EditorJsField;
