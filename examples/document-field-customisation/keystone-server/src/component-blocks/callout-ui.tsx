'use client'
import { ActionGroup, Item } from '@keystar/ui/action-group'
import { ActionButton } from '@keystar/ui/button'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'
import { Icon } from '@keystar/ui/icon'
import { Divider, Flex } from '@keystar/ui/layout'

import { type PropsWithChildren } from 'react'

import { alertOctagonIcon } from '@keystar/ui/icon/icons/alertOctagonIcon'
import { alertTriangleIcon } from '@keystar/ui/icon/icons/alertTriangleIcon'
import { checkCircle2Icon } from '@keystar/ui/icon/icons/checkCircle2Icon'
import { infoIcon } from '@keystar/ui/icon/icons/infoIcon'
import { css, tokenSchema } from '@keystar/ui/style'
import React from 'react'
import { NotEditable } from '@keystone-6/fields-document/component-blocks'

const toneToIcon = {
  caution: alertTriangleIcon,
  critical: alertOctagonIcon,
  info: infoIcon,
  positive: checkCircle2Icon,
}

const toneToColor = {
  caution: 'caution',
  critical: 'critical',
  info: 'accent',
  positive: 'positive',
} as const

export function Callout({
  children,
  tone = 'info',
  ...props
}: PropsWithChildren<{
  tone?: 'info' | 'caution' | 'critical' | 'positive'
}>) {
  let icon = toneToIcon[tone]
  let color = toneToColor[tone]
  return (
    <div
      {...props}
      className={css({
        borderRadius: tokenSchema.size.radius.regular,
        background: 'var(--bg)',
        color: 'var(--fg)',
        display: 'flex',
        gap: '1em',
        padding: '1em',

        svg: {
          flexShrink: 0,
          fill: 'none',
          stroke: 'currentColor',
          height: 20,
          width: 20,
        },
      })}
      style={{
        // @ts-expect-error
        '--bg': tokenSchema.color.background[color],
        '--fg': tokenSchema.color.foreground[color],
      }}
    >
      <NotEditable>
        <Icon src={icon} />
      </NotEditable>
      <div>{children}</div>
    </div>
  )
}

export function CalloutToolbar(props: {
  onChange: (tone: keyof typeof toneToIcon) => void
  tones: readonly { label: string; value: keyof typeof toneToIcon }[]
  tone: keyof typeof toneToIcon
  onRemove: () => void
}) {
  return (
    <Flex gap="regular" padding="regular">
      <ActionGroup
        selectionMode="single"
        prominence="low"
        density="compact"
        buttonLabelBehavior="hide"
        onAction={key => {
          props.onChange(key as any)
        }}
        selectedKeys={[props.tone]}
        items={props.tones}
      >
        {item => (
          <Item key={item.value} textValue={item.label}>
            <Icon src={toneToIcon[item.value]} />
            <Text>{item.label}</Text>
          </Item>
        )}
      </ActionGroup>
      <Divider orientation="vertical" />
      <TooltipTrigger>
        <ActionButton
          prominence="low"
          onPress={() => {
            props.onRemove()
          }}
        >
          <Icon src={trash2Icon} />
        </ActionButton>
        <Tooltip tone="critical">
          <Text>Remove</Text>
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  )
}
