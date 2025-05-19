import { assert, assertNever } from 'emery'
import { useId, useMemo } from 'react'

import { Grid } from '@keystar/ui/layout'
import { containerQueries, css } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import type { ComponentSchema, GenericPreviewProps, ObjectField } from '../../api'
import type { ExtraFieldInputProps } from '../../form-from-preview'
import { InnerFormValueContentFromPreviewProps } from '../../form-from-preview'
import { AddToPathProvider } from '../text/path-context'
import { FIELD_GRID_COLUMNS, FieldContextProvider } from '../context'

// this is just to get the react compiler to run on this, because of a todo
const belowTablet = containerQueries.below.tablet

function ObjectFieldInputEntry({
  field,
  fieldKey,
  span,
  forceValidation,
  firstFocusable,
  omitFieldAtPath,
}: {
  span: number
  fieldKey: string
  forceValidation: boolean
  firstFocusable: string | undefined
  field: GenericPreviewProps<ComponentSchema, unknown>
  omitFieldAtPath?: string[]
}) {
  return (
    <FieldContextProvider value={span}>
      <div
        className={css({
          gridColumn: `span ${span}`,

          [belowTablet]: {
            gridColumn: `span ${FIELD_GRID_COLUMNS}`,
          },
        })}
      >
        <AddToPathProvider part={fieldKey}>
          <InnerFormValueContentFromPreviewProps
            forceValidation={forceValidation}
            autoFocus={fieldKey === firstFocusable}
            omitFieldAtPath={omitFieldAtPath}
            {...field}
          />
        </AddToPathProvider>
      </div>
    </FieldContextProvider>
  )
}

export function ObjectFieldInput<Fields extends Record<string, ComponentSchema>>({
  schema,
  autoFocus,
  fields,
  forceValidation,
  omitFieldAtPath,
}: GenericPreviewProps<ObjectField<Fields>, unknown> & ExtraFieldInputProps) {
  validateLayout(schema)

  const firstFocusable = autoFocus ? findFocusableObjectFieldKey(schema) : undefined
  const innerOmitFieldAtPath = useMemo(() => {
    if (!omitFieldAtPath) {
      return undefined
    }
    return omitFieldAtPath.slice(1)
  }, [omitFieldAtPath])
  const inner = (
    <Grid
      columns={`repeat(${FIELD_GRID_COLUMNS}, minmax(auto, 1fr))`}
      columnGap="medium"
      rowGap="xlarge"
    >
      {Object.entries(fields).map(([key, propVal], index) => {
        let span = schema.layout?.[index] ?? FIELD_GRID_COLUMNS
        return (
          <ObjectFieldInputEntry
            key={key}
            span={span}
            field={propVal}
            fieldKey={key}
            forceValidation={forceValidation}
            firstFocusable={firstFocusable}
            {...(omitFieldAtPath?.[0] === key ? { omitFieldAtPath: innerOmitFieldAtPath } : {})}
          />
        )
      })}
    </Grid>
  )
  const id = useId()

  if (!schema.label) {
    return inner
  }

  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  return (
    <Grid
      role="group"
      gap="medium"
      marginY="xlarge"
      aria-labelledby={labelId}
      aria-describedby={schema.description ? descriptionId : undefined}
    >
      <Text color="neutralEmphasis" size="medium" weight="semibold" id={labelId}>
        {schema.label}
      </Text>
      {!!schema.description && (
        <Text id={descriptionId} size="regular" color="neutralSecondary">
          {schema.description}
        </Text>
      )}
      <div />
      {inner}
    </Grid>
  )
}

function validateLayout<Fields extends Record<string, ComponentSchema>>(
  schema: ObjectField<Fields>
): void {
  if (!schema.layout) {
    return
  }

  assert(
    schema.layout.length === Object.keys(schema.fields).length,
    'A column "span" is required for every field in the layout'
  )
  assert(
    schema.layout.every(span => span > 0),
    'The layout must not contain empty columns'
  )
  assert(
    schema.layout.every(span => span <= 12),
    'Fields may not span more than 12 columns'
  )
  assert(
    schema.layout.reduce((acc, cur) => acc + cur, 0) % 12 === 0,
    'The layout must span exactly 12 columns'
  )
}

function findFocusableObjectFieldKey(schema: ObjectField): string | undefined {
  for (const [key, innerProp] of Object.entries(schema.fields)) {
    const childFocusable = canFieldBeFocused(innerProp)
    if (childFocusable) {
      return key
    }
  }
  return undefined
}

function canFieldBeFocused(schema: ComponentSchema): boolean {
  if (schema.kind === 'array' || schema.kind === 'conditional' || schema.kind === 'form') {
    return true
  }
  if (schema.kind === 'object') {
    for (const innerProp of Object.values(schema.fields)) {
      if (canFieldBeFocused(innerProp)) {
        return true
      }
    }
    return false
  }
  assertNever(schema)
}
