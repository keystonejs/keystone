import { useSlotId } from '@react-aria/utils'
import { type ReactNode, useId } from 'react'

import { FieldButton } from '@keystar/ui/button'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { Icon } from '@keystar/ui/icon'
import { HStack, VStack } from '@keystar/ui/layout'
import { css, tokenSchema } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import { textCursorInputIcon } from '@keystar/ui/icon/icons/textCursorInputIcon'
import { EmptyState } from '../components/EmptyState'
import type {
  BaseListTypeInfo,
  ConditionalFieldFilter,
  ConditionalFieldFilterCase,
  FieldGroupMeta,
  FieldMeta,
} from '../../types'

// with implicit ANDing
function applyFilter<T>(
  filter: {
    equals?: T
    in?: T[]
  },
  val: T
): boolean {
  if (filter.equals !== undefined && val !== filter.equals) return false
  if (filter.in !== undefined && !filter.in.includes(val)) return false
  return true
}
export function testFilter(
  filter: ConditionalFieldFilterCase<BaseListTypeInfo> | undefined,
  serialized: Record<string, unknown>
): boolean {
  if (filter === undefined) return false
  if (typeof filter === 'boolean') return filter
  for (const [key, filterOnField] of Object.entries(filter)) {
    if (!filterOnField) continue
    const serializedValue = serialized[key]
    if (!applyFilter(filterOnField, serializedValue)) return false
    if (filterOnField.not !== undefined && applyFilter(filterOnField.not, serializedValue)) {
      return false
    }
  }
  return true
}

export function Fields({
  view,
  position,
  fields,
  groups = [],
  forceValidation,
  invalidFields,
  onChange,
  value: itemValue,
  fieldModes = {},
  fieldPositions = {},
  isRequireds,
}: {
  view: 'createView' | 'itemView'
  position: 'form' | 'sidebar'
  fields: Record<string, FieldMeta>
  forceValidation: boolean
  groups?: FieldGroupMeta[]
  invalidFields: ReadonlySet<string>
  onChange(value: Record<string, unknown>): void
  value: Record<string, unknown>
  fieldModes?: Record<string, ConditionalFieldFilter<'read' | 'edit' | 'hidden', BaseListTypeInfo>>
  fieldPositions?: Record<string, 'form' | 'sidebar'>
  isRequireds: Record<string, ConditionalFieldFilterCase<BaseListTypeInfo>>
}) {
  const fieldDomByKey: Record<string, ReactNode> = {}
  let focused = false
  const serialized: Record<string, unknown> = {}
  for (const [fieldKey, field] of Object.entries(fields)) {
    Object.assign(serialized, field.controller.serialize(itemValue[fieldKey]))
  }
  for (const fieldKey in fields) {
    const field = fields[fieldKey]
    const fieldPosition = fieldPositions[fieldKey] ?? field.itemView.fieldPosition
    if (view === 'itemView' && fieldPosition !== position) continue

    const fieldModeFilter = fieldModes[fieldKey] ?? field[view].fieldMode
    let fieldMode: 'read' | 'edit' | 'hidden'
    if (typeof fieldModeFilter === 'string') {
      fieldMode = fieldModeFilter
    } else {
      if (testFilter(fieldModeFilter.edit, serialized)) fieldMode = 'edit'
      else if (view === 'itemView' && testFilter(fieldModeFilter.read, serialized))
        fieldMode = 'read'
      else fieldMode = 'hidden'
    }
    if (fieldMode === 'hidden') continue

    const fieldValue = itemValue[fieldKey]
    const autoFocus = focused === false // not great, but focuses the first field
    focused = true

    fieldDomByKey[fieldKey] = (
      <field.views.Field
        key={fieldKey}
        autoFocus={autoFocus}
        forceValidation={forceValidation && invalidFields.has(fieldKey)}
        field={field.controller}
        isRequired={testFilter(isRequireds[fieldKey] ?? false, serialized)}
        onChange={
          fieldMode === 'read' || onChange === undefined
            ? undefined
            : newFieldValue => {
                onChange({
                  ...itemValue,
                  [field.controller.path]: newFieldValue,
                })
              }
        }
        value={fieldValue}
        itemValue={itemValue}
      />
    )
  }

  const groupByFieldKey: Record<string, FieldGroupMeta> = {}
  for (const group of groups) {
    for (const { path: fieldKey } of group.fields) {
      groupByFieldKey[fieldKey] = group
    }
  }

  // TODO: not sure what to do about the sidebar case. i think it's fine to
  // just render nothing for now, but we should revisit this.
  if (Object.keys(fieldDomByKey).length === 0 && position === 'form') {
    return (
      <EmptyState
        icon={textCursorInputIcon}
        title="No fields"
        message="There are no fields to be shown."
      />
    )
  }

  return (
    // the "inline" container allows fields to react to the width of their column
    <VStack gap="xlarge" UNSAFE_style={{ containerType: 'inline-size' }}>
      {[
        ...(function* () {
          const rendered: Record<string, true> = {}
          for (const fieldKey in fields) {
            if (fieldKey in rendered) continue

            const group = groupByFieldKey[fieldKey]
            if (group) {
              const fields = [
                ...(function* () {
                  for (const { path: fieldKey } of group.fields) {
                    if (fieldKey in rendered) continue
                    if (fieldDomByKey[fieldKey]) {
                      yield fieldDomByKey[fieldKey]
                    }
                    rendered[fieldKey] = true
                  }
                })(),
              ]
              if (fields.length === 0) continue
              yield (
                <FieldGroup key={group.label} label={group.label} description={group.description}>
                  {fields}
                </FieldGroup>
              )
              continue
            }

            yield fieldDomByKey[fieldKey] ?? null
            rendered[fieldKey] = true
          }
        })(),
      ]}
    </VStack>
  )
}

function FieldGroup({
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
