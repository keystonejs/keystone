/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core'
import { component, NotEditable } from '@keystone-6/fields-document/component-blocks'
import { Icon } from '@keystar/ui/icon'
import { infoIcon } from '@keystar/ui/icon/icons/infoIcon'
import { alertTriangleIcon } from '@keystar/ui/icon/icons/alertTriangleIcon'
import { alertOctagonIcon } from '@keystar/ui/icon/icons/alertOctagonIcon'
import { checkCircleIcon } from '@keystar/ui/icon/icons/checkCircleIcon'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'

import { callout as CalloutSchema } from './schemas'
import { Flex } from '@keystar/ui/layout'
import { EditorToolbarButton, EditorToolbarSeparator } from '@keystar/ui/editor'
import { Button } from '@keystar/ui/button'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'

const calloutIconMap = {
  info: <Icon src={infoIcon} />,
  error: <Icon src={alertOctagonIcon} />,
  warning: <Icon src={alertTriangleIcon} />,
  success: <Icon src={checkCircleIcon} />,
}

export const callout = component({
  label: 'Callout',
  chromeless: true,
  schema: CalloutSchema.schema,
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
    const intentConfig = intentMap[props.fields.intent.value] as any

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
      <Flex gap="regular">
        {props.fields.intent.options.map(opt => {
          return (
            <TooltipTrigger key={opt.value}>
              <EditorToolbarButton
                isSelected={props.fields.intent.value === opt.value}
                onPress={() => {
                  props.fields.intent.onChange(opt.value)
                }}
              >
                <Icon src={calloutIconMap[opt.value]} />
              </EditorToolbarButton>
              <Tooltip>{opt.label}</Tooltip>
            </TooltipTrigger>
          )
        })}

        <EditorToolbarSeparator />

        <TooltipTrigger>
          <Button tone="critical" onPress={onRemove}>
            <Icon src={trash2Icon} />
          </Button>
          <Tooltip>Remove</Tooltip>
        </TooltipTrigger>
      </Flex>
    )
  },
})
