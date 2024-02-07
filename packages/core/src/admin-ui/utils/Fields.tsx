/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Stack, useTheme, Text } from '@keystone-ui/core'
import { memo, type ReactNode, useContext, useId, useCallback } from 'react'
import { FieldDescription } from '@keystone-ui/fields'
import { ButtonContext } from '@keystone-ui/button'
import {
  type FieldGroupMeta,
  type FieldMeta,
  type ControllerValue
} from '../../types'

const Field = memo(function Field_ ({
  field,
  autoFocus,
  forceValidation,
  onChange,
  value,
  itemValue,
  mode,
  position
}: {
  field: FieldMeta
  autoFocus?: boolean
  forceValidation?: boolean
  onChange: (value: ControllerValue) => void
  value: unknown
  itemValue: ControllerValue
  mode: 'create' | 'item' | 'list',
  position: 'form' | 'sidebar'
}) {
  const fieldMode = mode === 'create' ? field.createView.fieldMode : mode === 'item' ? field.itemView.fieldMode : field.listView.fieldMode ?? 'edit'
  const fieldPosition = mode === 'item' ? field.itemView.fieldPosition : position
  if (fieldMode === 'hidden') return null
  if (fieldPosition !== position) return null

  const onChange_ = useCallback((value: ControllerValue) => {
    if (fieldMode !== 'edit') return
    onChange({
      ...itemValue,
      [field.controller.path]: value
    })
  }, [itemValue, onChange, field.controller.path])

  return <field.views.Field
    field={field.controller}
    autoFocus={autoFocus}
    forceValidation={forceValidation}
    onChange={onChange_}
    value={value}
    itemValue={itemValue}
  />
})

export function Fields ({
  groups = [],
  fields,
  forceValidation,
  invalidFields,
  onChange,
  value: itemValue,
  mode = 'item',
  position = 'form',
}: {
  groups?: FieldGroupMeta[]
  fields: Record<string, FieldMeta>
  forceValidation: boolean
  invalidFields: ReadonlySet<string>
  onChange: (value: ControllerValue) => void
  value: ControllerValue
  mode?: 'create' | 'item' | 'list',
  position?: 'form' | 'sidebar'
}) {
  const rendered: ReactNode[] = []
  let count = 0

  if (groups.length) {
    for (const group of groups) {
      rendered.push(<FieldGroup
        key={rendered.length}
        label={group.label}
        description={group.description}>
        {group.fields.map((field) => {
          const fieldValue = itemValue[field.path]

          return <Field
            key={field.path}
            field={field}
            autoFocus={count++ === 0}
            forceValidation={forceValidation && invalidFields.has(field.path)}
            onChange={onChange}
            value={fieldValue}
            itemValue={itemValue}
            mode={mode}
            position={position}
          />
        })}
      </FieldGroup>)
    }
  } else {
    for (const field of Object.values(fields)) {
      const fieldValue = itemValue[field.path]

      rendered.push(<Field
        key={field.path}
        field={field}
        autoFocus={count++ === 0}
        forceValidation={forceValidation && invalidFields.has(field.path)}
        onChange={onChange}
        value={fieldValue}
        itemValue={itemValue}
        mode={mode}
        position={position}
      />)
    }
  }

  return <Stack gap="xlarge">
    {rendered.every(x => x === null) ? 'There are no fields that you can read or edit' : rendered}
  </Stack>
}

function FieldGroup (props: { label: string, description: string | null, children: ReactNode }) {
  const descriptionId = useId()
  const labelId = useId()
  const theme = useTheme()
  const buttonSize = 24
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
      aria-describedby={props.description === null ? undefined : descriptionId}
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
            <Text id={labelId} size="large" weight="bold" css={{ position: 'relative' }}>
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
            {props.description !== null && (
              <FieldDescription id={descriptionId}>{props.description}</FieldDescription>
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
