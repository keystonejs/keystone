import React from 'react';
import { component, fields, NotEditable } from '@keystone-next/fields-document/component-blocks';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { useTheme } from '@keystone-ui/core';
import { Tooltip } from '@keystone-ui/tooltip';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-next/fields-document/primitives';

const noticeIcons = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
};

export const componentBlocks = {
  notice: component({
    // this will show up in the insert menu in the document editor toolbar/with the `/` shortcut
    label: 'Notice',
    // this configures what data the component block stores
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
      // fields.child provides a react node in the preview component which will allow users of the Admin UI
      // to edit the content within like any other part of the document
      content: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: 'inherit',
        dividers: 'inherit',
        links: 'inherit',
        relationships: 'inherit',
      }),
    },
    // This component will be used to present the block in the document editor
    // it accepts props that correspond to the `props` config above, and uses
    // the
    component: function Notice({ content, intent }) {
      const { palette, radii, spacing } = useTheme();
      const intentConfig = {
        info: {
          background: palette.blue100,
          foreground: palette.blue700,
          icon: noticeIcons.info,
        },
        error: {
          background: palette.red100,
          foreground: palette.red700,
          icon: noticeIcons.error,
        },
        warning: {
          background: palette.yellow100,
          foreground: palette.yellow700,
          icon: noticeIcons.warning,
        },
        success: {
          background: palette.green100,
          foreground: palette.green700,
          icon: noticeIcons.success,
        },
      }[intent.value];

      return (
        <div
          style={{
            background: intentConfig.background,
            borderRadius: radii.small,
            display: 'flex',
            paddingLeft: spacing.medium,
            paddingRight: spacing.medium,
          }}
        >
          <NotEditable>
            <div
              style={{
                color: intentConfig.foreground,
                marginRight: spacing.small,
                marginTop: '1em',
              }}
            >
              <intentConfig.icon />
            </div>
          </NotEditable>
          <div style={{ flex: 1 }}>{content}</div>
        </div>
      );
    },
    // this hides the chrome around the component block that is shown by default
    // which also means that the form so the toolbar/preview must provide all the ui for customising the component
    chromeless: true,
    // This defines the inline toolbar shown at the bottom of the component block while editting it.
    // This is where we provide UI to select the intent of the notice. We set the intent value using
    // props.intent.onChange(). We also provide a
    toolbar({ props, onRemove }) {
      return (
        <ToolbarGroup>
          {props.intent.options.map(opt => {
            const Icon = noticeIcons[opt.value];

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
