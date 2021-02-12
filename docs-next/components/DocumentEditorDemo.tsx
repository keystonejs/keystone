/** @jsx jsx */
import { Global, jsx, useTheme } from '@keystone-ui/core';
import { useState } from 'react';
import { DocumentEditor } from '@keystone-next/fields-document/src/DocumentEditor';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-next/fields-document/primitives';
import { component, fields } from '@keystone-next/fields-document/component-blocks';
import { Tooltip } from '@keystone-ui/tooltip';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { DocumentFeatures } from '@keystone-next/fields-document/src/views';

const noticeIconMap = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
};

const documentFeatures: DocumentFeatures = {
  formatting: {
    alignment: { center: true, end: true },
    blockTypes: { blockquote: true, code: true },
    headingLevels: [1, 2, 3, 4, 5, 6],
    inlineMarks: {
      bold: true,
      code: true,
      italic: true,
      keyboard: true,
      strikethrough: true,
      subscript: true,
      superscript: true,
      underline: true,
    },
    listTypes: { ordered: true, unordered: true },
    softBreaks: true,
  },
  dividers: true,
  links: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
    [1, 2, 1],
  ],
};

const emptyObj = {};

const componentBlocks = {
  notice: component({
    component: function Notice({ content, intent }) {
      const { palette, radii, spacing } = useTheme();
      const intentMap = {
        info: {
          background: palette.blue100,
          foreground: palette.blue700,
          icon: noticeIconMap.info,
        },
        error: {
          background: palette.red100,
          foreground: palette.red700,
          icon: noticeIconMap.error,
        },
        warning: {
          background: palette.yellow100,
          foreground: palette.yellow700,
          icon: noticeIconMap.warning,
        },
        success: {
          background: palette.green100,
          foreground: palette.green700,
          icon: noticeIconMap.success,
        },
      };
      const intentConfig = intentMap[intent.value];

      return (
        <div
          css={{
            borderRadius: radii.small,
            display: 'flex',
            paddingLeft: spacing.medium,
            paddingRight: spacing.medium,
          }}
          style={{
            background: intentConfig.background,
          }}
        >
          <div
            contentEditable={false}
            css={{
              color: intentConfig.foreground,
              marginRight: spacing.small,
              marginTop: '1em',
              userSelect: 'none',
            }}
          >
            <intentConfig.icon />
          </div>
          <div css={{ flex: 1 }}>{content}</div>
        </div>
      );
    },
    label: 'Notice',
    chromeless: true,
    props: {
      intent: fields.select({
        label: 'Intent',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'success', label: 'Success' },
        ] as const,
        defaultValue: 'info',
      }),
      content: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: 'inherit',
        dividers: 'inherit',
        links: 'inherit',
        relationships: 'inherit',
      }),
    },
    toolbar({ props, onRemove }) {
      return (
        <ToolbarGroup>
          {props.intent.options.map(opt => {
            const Icon = noticeIconMap[opt.value];

            return (
              <Tooltip key={opt.value} content={opt.label} weight="subtle">
                {attrs => (
                  <ToolbarButton
                    isSelected={props.intent.value === opt.value}
                    onClick={() => {
                      props.intent.onChange(opt.value);
                    }}
                    {...attrs}
                  >
                    <Icon size="small" />
                  </ToolbarButton>
                )}
              </Tooltip>
            );
          })}

          <ToolbarSeparator />

          <Tooltip content="Remove" weight="subtle">
            {attrs => (
              <ToolbarButton variant="destructive" onClick={onRemove} {...attrs}>
                <Trash2Icon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      );
    },
  }),
};

export const DocumentEditorDemo = () => {
  const [value, setValue] = useState([
    { type: 'paragraph', children: [{ text: 'Try using the document editor!' }] },
  ] as any);

  const theme = useTheme();
  return (
    <div
      css={{
        // the editor mostly expects things not be the default styles
        // and tailwind messes that up, so these values are from Chrome's default styles
        'blockquote, p, pre': {
          marginTop: '1em',
          marginBottom: '1em',
        },
        'h1,h2,h3,h4,h5,h6': { fontWeight: 'bold' },
        h1: { fontSize: '2em' },
        h2: { fontSize: '1.5em' },
        h3: { fontSize: '1.17em' },
        h5: { fontSize: '0.83em' },
        h6: { fontSize: '0.67em' },
        borderBottom: `1px ${theme.colors.border} solid`,
      }}
    >
      <Global
        styles={{
          body: {
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        }}
      />
      <DocumentEditor
        value={value}
        onChange={setValue}
        documentFeatures={documentFeatures}
        componentBlocks={componentBlocks}
        relationships={emptyObj}
      />
    </div>
  );
};
