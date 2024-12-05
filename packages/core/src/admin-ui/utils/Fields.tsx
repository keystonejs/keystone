import { useSlotId } from '@react-aria/utils'
import React, {
  type ReactNode,
  memo,
  useId,
  useMemo
} from 'react'

import { FieldButton } from '@keystar/ui/button'
import { textCursorInputIcon } from '@keystar/ui/icon/icons/textCursorInputIcon'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { Icon } from '@keystar/ui/icon'
import { HStack, VStack } from '@keystar/ui/layout'
import { css, tokenSchema } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

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

const RenderField = memo(function RenderField({
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
      autoFocus={autoFocus}
      forceValidation={forceValidation}
      environment={environment}
      field={field.controller}
      onChange={useMemo(() => {
        if (onChange === undefined) return undefined
        return value => {
          onChange(val => ({
            ...val,
            [field.controller.path]: { kind: 'value', value },
          }))
        }
      }, [onChange, field.controller.path])}
      value={value}
      itemValue={itemValue}
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
  value: itemValue,
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
      const fieldValue = itemValue[fieldKey]
      const fieldMode = fieldModes === null ? 'edit' : fieldModes[fieldKey]
      const fieldPosition = fieldPositions === null ? 'form' : fieldPositions[fieldKey]

      if (fieldMode === 'hidden') return [fieldKey, null]
      if (fieldPosition !== position) return [fieldKey, null]
      // TODO: this isn't accessible, it should:
      // - render an inline alert (`Notice`), or
      // - invoke a "critical" toast message
      if (fieldValue.kind === 'error') {
        return [
          fieldKey,
          <Text key={fieldKey}>
            {field.label}: <Text color="critical">{fieldValue.errors[0].message}</Text>
          </Text>,
        ]
      }

      return [
        fieldKey,
        <RenderField
          key={fieldKey}
          environment={environment}
          field={field}
          value={fieldValue.value}
          itemValue={itemValue}
          forceValidation={forceValidation && invalidFields.has(fieldKey)}
          onChange={fieldMode === 'edit' ? onChange : undefined}
          autoFocus={fieldKey === firstFocusable}
        />,
      ]
    })
  )
  const rendered: ReactNode[] = []
  const fieldGroups = new Map<
    string,
    {
      rendered: boolean
      group: FieldGroupMeta
    }
  >()
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
      if (groupState.rendered) continue
      groupState.rendered = true

      const { group } = groupState
      const renderedFieldsInGroup = group.fields.map(field => renderedFields[field.path])
      if (renderedFieldsInGroup.every(field => field === null)) continue
      rendered.push(
        <FieldGroup label={group.label} description={group.description}>
          {renderedFieldsInGroup}
        </FieldGroup>
      )
      continue
    }

    if (renderedFields[fieldKey] === null) continue
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

  // the "inline" container allows fields to react to the width of their column
  return (
    <VStack gap="xlarge" UNSAFE_style={{ containerType: 'inline-size' }}>
      {rendered}
    </VStack>
  )
}

function FieldGroup (props: {
  label: string
  description: string | null
  children: ReactNode
}) {
  const labelId = useId()
  const descriptionId = useSlotId([Boolean(props.description)])

  return (
    <details aria-labelledby={labelId} aria-describedby={descriptionId} open>
      <HStack
        gap="medium"
        alignItems="center"
        elementType="summary"
        UNSAFE_className={css({
          listStyle: 'none',
          outline: 0,
          '::-webkit-details-marker': { display: 'none' },
        })}
      >
        <FieldButton
          // @ts-expect-error — this works, it's just not exposed in the public types
          elementType="div"
          // the <summary/> (above) is the focusable element
          excludeFromTabOrder
          prominence="low"
          height="element.small"
          width="element.small"
          minWidth="auto"
          UNSAFE_className={css({
            'details[open] &': {
              transform: 'rotate(90deg)',
            },
          })}
        >
          <Icon src={chevronRightIcon} size="medium" />
        </FieldButton>
        <VStack
          gap="regular"
          UNSAFE_className={css({
            cursor: 'default',
            userSelect: 'none',
          })}
        >
          <Text
            color="neutralEmphasis"
            size="large"
            weight="medium"
            id={labelId}
            position="relative"
          >
            {props.label}
          </Text>
          {!!props.description && (
            <Text id={descriptionId} size="regular" color="neutralSecondary">
              {props.description}
            </Text>
          )}
        </VStack>
      </HStack>

      {/*
        Padding is applied here because `<details>` doesn't accept flex/grid
        layout, prefer "gap" in most cases.
      */}
      <HStack gap="medium" paddingTop="medium">
        <GroupIndicatorLine />
        <VStack gap="xlarge" flex>
          {props.children}
        </VStack>
      </HStack>
    </details>
  )
}

export function GroupIndicatorLine() {
  return (
    <HStack justifyContent="center" width="element.small">
      <div
        className={css({
          height: '100%',
          width: tokenSchema.size.alias.focusRing,
          borderRadius: tokenSchema.size.alias.focusRing,
          backgroundColor: tokenSchema.color.border.neutral,
          flexShrink: 0,
        })}
      />
    </HStack>
  )
}
