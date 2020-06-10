/** @jsx jsx */

import { forwardRef, useState, useMemo } from 'react';
import { jsx } from '@emotion/core';
import { styles } from './styles';
import { A11yText } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';
import { gridSize, colors, borderRadius } from '@arch-ui/theme';
import { FieldContainer, FieldLabel, FieldDescription } from '@arch-ui/fields';

import 'codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';

import { Controlled as CodeMirror } from 'react-codemirror2';
import { getTools } from './get-tools';

const ToolbarButton = forwardRef((props, ref) => {
  return (
    <button
      type="button"
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontSize: 16,
        outline: 'none',
      }}
      ref={ref}
      {...props}
    />
  );
});

const IconToolbarButton = ({ isActive, label, icon, tooltipPlacement = 'top', ...props }) => {
  return (
    <Tooltip placement={tooltipPlacement} css={{ margin: gridSize * 2 }} content={label}>
      {ref => (
        <ToolbarButton
          type="button"
          css={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            border: 0,
            cursor: 'pointer',
            fontSize: 16,
            outline: 'none',
          }}
          ref={ref}
          {...props}
        >
          {icon}
          <A11yText>{label}</A11yText>
        </ToolbarButton>
      )}
    </Tooltip>
  );
};

export default function MarkdownField({ field, errors, value, onChange, isDisabled }) {
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  const [tools, setTools] = useState([]);

  const toolbar = useMemo(() => {
    return (
      <div
        css={{
          display: 'flex',
          padding: `${gridSize}px 0`,
          borderBottom: `1px solid ${colors.N10}`,
          marginBottom: `${gridSize}px`,
        }}
      >
        {tools.map(({ action, label, icon: Icon }) => {
          return (
            <IconToolbarButton
              key={label}
              icon={<Icon />}
              onClick={action}
              label={label}
              disabled={isDisabled}
            />
          );
        })}
      </div>
    );
  }, [tools]);

  if (accessError) return null;

  return (
    <FieldContainer
      css={[
        styles,
        {
          '.cm-s-mirrormark .CodeMirror-scroll': {
            padding: 0,
            marginBottom: '1em',
          },
        },
      ]}
    >
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <div
        css={{
          border: `1px ${colors.N20} solid`,
          borderRadius,
          padding: `${gridSize}px`,
        }}
      >
        {toolbar}
        <CodeMirror
          value={value}
          onBeforeChange={(editor, data, value) => {
            onChange(value);
          }}
          options={{
            mode: 'gfm',
            theme: 'default mirrormark',
            tabSize: '2',
            lineWrapping: true,
            addModeClass: true,
            readOnly: isDisabled,
          }}
          editorDidMount={editor => {
            setTools(getTools(editor));
          }}
        />
      </div>
    </FieldContainer>
  );
}
