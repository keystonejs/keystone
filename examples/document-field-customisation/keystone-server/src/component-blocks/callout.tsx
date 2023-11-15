/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core'
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-6/fields-document/primitives'
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon'
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon'
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon'
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'
import { Tooltip } from '@keystone-ui/tooltip'

const calloutIconMap = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
}

export const callout = component({
  label: 'Callout',
  chromeless: true,
  schema: {
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
  preview: function Callout (props) {
    const { palette, radii, spacing } = useTheme()
    const intentMap = {
      info: {
        background: palette.blue100,
        foreground: palette.blue700,
        icon: calloutIconMap.info,
      },
      error: {
        background: palette.red100,
        foreground: palette.red700,
        icon: calloutIconMap.error,
      },
      warning: {
        background: palette.yellow100,
        foreground: palette.yellow700,
        icon: calloutIconMap.warning,
      },
      success: {
        background: palette.green100,
        foreground: palette.green700,
        icon: calloutIconMap.success,
      },
    }
    const intentConfig = intentMap[props.fields.intent.value]

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
        <NotEditable>
          <div
            css={{
              color: intentConfig.foreground,
              marginRight: spacing.small,
              marginTop: '1em',
            }}
          >
            <intentConfig.icon />
          </div>
        </NotEditable>
        <div css={{ flex: 1 }}>{props.fields.content.element}</div>
      </div>
    )
  },
  toolbar: function CalloutToolbar ({ props, onRemove }) {
    return (
      <ToolbarGroup>
        {props.fields.intent.options.map(opt => {
          const Icon = calloutIconMap[opt.value]

          return (
            <Tooltip key={opt.value} content={opt.label} weight="subtle">
              {attrs => (
                <ToolbarButton
                  isSelected={props.fields.intent.value === opt.value}
                  onClick={() => {
                    props.fields.intent.onChange(opt.value)
                  }}
                  {...attrs}
                >
                  <Icon size="small" />
                </ToolbarButton>
              )}
            </Tooltip>
          )
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
    )
  },
})
