/** @jsxRuntime classic */
/** @jsx jsx */

import { useSlotId } from '@react-aria/utils'

import { textCursorInputIcon } from '@keystar/ui/icon/icons/textCursorInputIcon'
import { VStack } from '@keystar/ui/layout'
import { Text } from '@keystar/ui/typography'

import { jsx, Stack, useTheme } from '@keystone-ui/core'
import { memo, type ReactNode, useContext, useId, useMemo } from 'react'
import { ButtonContext } from '@keystone-ui/button'
import type {
  FieldEnvironment,
  FieldGroupMeta,
  FieldMeta,
  Item,
} from '../../types'
import { EmptyState } from '../components/EmptyState'
import { type Value } from '.'

type RenderFieldProps = {
  autoFocus?: boolean
  environment: FieldEnvironment
  field: FieldMeta
  forceValidation?: boolean
  itemValue: Item
  onChange?(value: (value: Value) => Value): void
  value: unknown
}

const RenderField = memo(function RenderField ({
  environment,
  field,
  value,
  itemValue,
  autoFocus,
  forceValidation,
  onChange,
}: RenderFieldProps) {
  return (
    <field.views.Field
      environment={environment}
      field={field.controller}
      onChange={useMemo(() => {
        if (onChange === undefined) return undefined
        return value => {
          onChange(val => ({ ...val, [field.controller.path]: { kind: 'value', value } }))
        }
      }, [onChange, field.controller.path])}
      value={value}
      itemValue={itemValue}
      autoFocus={autoFocus}
      forceValidation={forceValidation}
    />
  )
})

type FieldsProps = {
  /**
   * The environment in which the fields are being rendered. Certain fields may
   * render differently depending on context, for example the relationship field
   * does not support "add" behavior in the create dialog.
   * 
   * @default 'edit-page'
  */
  environment?: FieldEnvironment
  fieldModes?: Record<string, 'hidden' | 'edit' | 'read'> | null
  fieldPositions?: Record<string, 'form' | 'sidebar'> | null
  fields: Record<string, FieldMeta>
  forceValidation: boolean
  groups?: FieldGroupMeta[]
  invalidFields: ReadonlySet<string>
  onChange(value: (value: Value) => Value): void
  position?: 'form' | 'sidebar'
  value: Value
}

export function Fields ({
  environment = 'edit-page',
  fields,
  value,
  fieldModes = null,
  fieldPositions = null,
  forceValidation,
  invalidFields,
  position = 'form',
  groups = [],
  onChange,
}: FieldsProps) {
  // TODO: auto-focusing the first field makes sense for e.g. the create item
  // view, but may be disorienting in other situations. this needs to be
  // revisited, and the result should probably be memoized
  const firstFocusable = Object.keys(fields).find(fieldKey => {
    const fieldMode = fieldModes === null ? 'edit' : fieldModes[fieldKey]
    const fieldPosition = fieldPositions === null ? 'form' : fieldPositions[fieldKey]
    return fieldMode !== 'hidden' && fieldPosition === 'form'
  })

  const renderedFields = Object.fromEntries(
    Object.keys(fields).map((fieldKey, index) => {
      const field = fields[fieldKey]
      const val = value[fieldKey]
      const fieldMode = fieldModes === null ? 'edit' : fieldModes[fieldKey]
      const fieldPosition = fieldPositions === null ? 'form' : fieldPositions[fieldKey]

      if (fieldMode === 'hidden') return [fieldKey, null]
      if (fieldPosition !== position) return [fieldKey, null]
      // TODO: this isn't accessible, it should:
      // - render an inline alert (`Notice`), or
      // - invoke a "critical" toast message
      if (val.kind === 'error') {
        return [
          fieldKey,
          <div key={fieldKey}>
            {field.label}: <span css={{ color: 'red' }}>{val.errors[0].message}</span>
          </div>,
        ]
      }

      return [
        fieldKey,
        <RenderField
          key={fieldKey}
          environment={environment}
          field={field}
          value={val.value}
          itemValue={value}
          forceValidation={forceValidation && invalidFields.has(fieldKey)}
          onChange={fieldMode === 'edit' ? onChange : undefined}
          autoFocus={fieldKey === firstFocusable}
        />,
      ]
    })
  )
  const rendered: ReactNode[] = []
  const fieldGroups = new Map<string, { rendered: boolean, group: FieldGroupMeta }>()
  for (const group of groups) {
    const state = { group, rendered: false }
    for (const field of group.fields) {
      fieldGroups.set(field.path, state)
    }
  }
  for (const field of Object.values(fields)) {
    const fieldKey = field.path
    if (fieldGroups.has(fieldKey)) {
      const groupState = fieldGroups.get(field.path)!
      if (groupState.rendered) {
        continue
      }
      groupState.rendered = true
      const { group } = groupState
      const renderedFieldsInGroup = group.fields.map(field => renderedFields[field.path])
      if (renderedFieldsInGroup.every(field => field === null)) {
        continue
      }
      rendered.push(
        <FieldGroup label={group.label} description={group.description}>
          {renderedFieldsInGroup}
        </FieldGroup>
      )
      continue
    }
    if (renderedFields[fieldKey] === null) {
      continue
    }
    rendered.push(renderedFields[fieldKey])
  }

  // TODO: not sure what to do about the sidebar case. i think it's fine to
  // just render nothing for now, but we should revisit this.
  if (rendered.length === 0 && position === 'form') {
    return (
      <EmptyState
        icon={textCursorInputIcon}
        title="No fields"
        message="There are no fields matching access."
      />
    )
  }

  return (
    <VStack gap="xlarge">
      {rendered}
    </VStack>
  )
}

const buttonSize = 24

function FieldGroup (props: {
  label: string,
  description: string | null,
  children: ReactNode
}) {
  const labelId = useId()
  const descriptionId = useSlotId([Boolean(props.description)]);
  const theme = useTheme()
  const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext)
  const buttonStyles = useButtonStyles({ tokens: useButtonTokens(defaults) })
  const divider = (
    <div
      css={{
        height: '100%',
        width: 2,
        backgroundColor: theme.colors.border,
      }}
    />
  )
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
    >
      <details open>
        <summary
          css={{ listStyle: 'none', outline: 0, '::-webkit-details-marker': { display: 'none' } }}
        >
          <Stack across gap="medium">
            <div // this is a div rather than a button because the interactive element here is the <summary> above
              css={{
                ...buttonStyles,
                'summary:focus &': buttonStyles[':focus'],
                padding: 0,
                height: buttonSize,
                width: buttonSize,
                'details[open] &': {
                  transform: 'rotate(90deg)',
                },
              }}
            >
              {downChevron}
            </div>
            {divider}
            <Text
              color="neutralEmphasis"
              size="medium"
              weight="semibold"
              id={labelId}
              position="relative"
            >
              {props.label}
            </Text>
          </Stack>
        </summary>
        <div css={{ display: 'flex' }}>
          <div css={{ display: 'flex' }}>
            <Stack across gap="medium">
              <div css={{ width: buttonSize }} />
              {divider}
            </Stack>
          </div>
          <Stack marginLeft="medium" css={{ width: '100%' }}>
            {!!props.description && (
              <Text id={descriptionId} size="regular" color="neutralSecondary">
                {props.description}
              </Text>
            )}
            <Stack marginTop="large" gap="xlarge">
              {props.children}
            </Stack>
          </Stack>
        </div>
      </details>
    </div>
  )
}

const downChevron = (
  <svg width="16" height="16" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L8.75 6L5 9L5 3Z" fill="currentColor" />
  </svg>
)
