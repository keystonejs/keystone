import { useSlotId } from '@react-aria/utils'
import React, {
  type ReactNode,
  useId,
} from 'react'

import { FieldButton } from '@keystar/ui/button'
import { textCursorInputIcon } from '@keystar/ui/icon/icons/textCursorInputIcon'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { Icon } from '@keystar/ui/icon'
import { HStack, VStack } from '@keystar/ui/layout'
import { css, tokenSchema } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import type {
  FieldGroupMeta,
  FieldMeta,
} from '../../types'
import { EmptyState } from '../components/EmptyState'

export function Fields ({
  view = 'itemView',
  position = 'form',
  fields,
  groups = [],
  forceValidation,
  invalidFields,
  onChange,
  value: itemValue,
}: {
  view?: 'createView' | 'itemView'
  position?: 'form' | 'sidebar'
  fields: Record<string, FieldMeta>
  forceValidation: boolean
  groups?: FieldGroupMeta[]
  invalidFields: ReadonlySet<string>
  onChange(value: Record<string, unknown>): void
  value: Record<string, unknown>
}) {
  let focused = false
  const renderedFields = Object.fromEntries(
    Object.keys(fields).map((fieldKey) => {
      const field = fields[fieldKey]
      if (view === 'itemView' && field.itemView.fieldPosition !== position) return [fieldKey, null]

      const { fieldMode } = field[view]
      if (fieldMode === 'hidden') return [fieldKey, null]

      const fieldValue = itemValue[fieldKey]
      const autoFocus = focused === false // not great, but focuses the first field
      focused = true

      return [
        fieldKey,
        <field.views.Field
          key={fieldKey}
          autoFocus={autoFocus}
          forceValidation={forceValidation && invalidFields.has(fieldKey)}
          field={field.controller}
          onChange={(newFieldValue) => {
            if (fieldMode !== 'edit') return
            if (onChange === undefined) return
            onChange({
              ...itemValue,
              [field.controller.path]: newFieldValue,
            })
          }}
          value={fieldValue}
          itemValue={itemValue}
        />
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
        <FieldGroup key={group.label} label={group.label} description={group.description}>
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

function FieldGroup ({
  description,
  label,
  children,
}: {
  label: string
  description: string | null
  children: ReactNode
}) {
  const labelId = useId()
  const descriptionId = useSlotId([Boolean(description)])

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
            {label}
          </Text>
          {!!description && (
            <Text id={descriptionId} size="regular" color="neutralSecondary">
              {description}
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
          {children}
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
