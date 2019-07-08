/** @jsx jsx */

import { forwardRef, useState, useMemo } from 'react';
import { jsx } from '@emotion/core';
import { styles } from './styles';
import { A11yText } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';
import { gridSize, colors, borderRadius } from '@arch-ui/theme';
import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import 'codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { getTools } from './get-tools';

let ToolbarButton = forwardRef((props, ref) => {
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

let IconToolbarButton = ({ isActive, label, icon, tooltipPlacement = 'top', ...props }) => {
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

export default function MarkdownField({ field, errors, value, onChange }) {
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  let [tools, setTools] = useState([]);

  let toolbar = useMemo(() => {
    return (
      <div css={{ display: 'flex', paddingTop: gridSize }}>
        {tools.map(tool => {
          let onClick = () => {
            tool.action();
          };
          return (
            <IconToolbarButton
              key={tool.label}
              icon={<tool.icon />}
              onClick={onClick}
              label={tool.label}
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
            paddingTop: gridSize,
            paddingLeft: gridSize,
          },
        },
      ]}
    >
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <div
        css={{
          border: `1px ${colors.N20} solid`,
          borderRadius,
          paddingBottom: gridSize,
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
          }}
          editorDidMount={editor => {
            setTools(getTools(editor));
          }}
        />
      </div>
    </FieldContainer>
  );
}
