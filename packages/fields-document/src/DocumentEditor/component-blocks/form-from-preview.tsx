/** @jsxRuntime classic */
/** @jsx jsx */
import { useList } from '@keystone-6/core/admin-ui/context'
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect'
import { Button } from '@keystone-ui/button'
import { jsx, Stack } from '@keystone-ui/core'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { PlusCircleIcon } from '@keystone-ui/icons/icons/PlusCircleIcon'
import { AlertDialog } from '@keystone-ui/modals'
import { memo, useCallback, useMemo, useState, type MemoExoticComponent, type ReactElement } from 'react'
import { DragHandle, OrderableItem, OrderableList, RemoveButton } from '../primitives/orderable'
import {
  type ArrayField,
  type ComponentSchema,
  type ConditionalField,
  type FormField,
  type GenericPreviewProps,
  type ObjectField,
  type RelationshipData,
  type RelationshipField,
} from './api'
import { previewPropsToValue, setValueToPreviewProps } from './get-value'
import { createGetPreviewProps } from './preview-props'
import { assertNever, clientSideValidateProp } from './utils'

type DefaultFieldProps<Key> = GenericPreviewProps<
  Extract<ComponentSchema, { kind: Key }>,
  unknown
> & {
  autoFocus?: boolean
  forceValidation?: boolean
}

function ArrayFieldPreview (props: DefaultFieldProps<'array'>) {
  return (
    <Stack gap="medium">
      {props.schema.label && <FieldLabel>{props.schema.label}</FieldLabel>}
      <OrderableList {...props}>
        {props.elements.map(val => {
          return (
            <OrderableItemInForm
              elementKey={val.key}
              label={props.schema.itemLabel?.(val) ?? 'Item'}
              {...val}
            />
          )
        })}
      </OrderableList>
      <Button
        autoFocus={props.autoFocus}
        onClick={() => {
          props.onChange([...props.elements.map(x => ({ key: x.key })), { key: undefined }])
        }}
        tone="active"
      >
        <Stack gap="small" across>
          <PlusCircleIcon size="smallish" /> <span>Add</span>
        </Stack>
      </Button>
    </Stack>
  )
}

function RelationshipFieldPreview ({
  schema,
  autoFocus,
  onChange,
  value,
}: DefaultFieldProps<'relationship'>) {
  const list = useList(schema.listKey)
  const searchFields = Object.keys(list.fields).filter(key => list.fields[key].search)

  return (
    <FieldContainer>
      <FieldLabel>{schema.label}</FieldLabel>
      <RelationshipSelect
        autoFocus={autoFocus}
        controlShouldRenderValue
        isDisabled={false}
        list={list}
        labelField={list.labelField}
        searchFields={searchFields}
        extraSelection={schema.selection || ''}
        portalMenu
        state={
          schema.many
            ? {
                kind: 'many',
                value: (value as RelationshipData[]).map(x => ({
                  id: x.id,
                  label: x.label || x.id,
                  data: x.data,
                })),
                onChange: onChange,
              }
            : {
                kind: 'one',
                value: value
                  ? {
                      ...(value as RelationshipData),
                      label: (value as RelationshipData).label || (value as RelationshipData).id,
                    }
                  : null,
                onChange: onChange,
              }
        }
      />
    </FieldContainer>
  )
}

function FormFieldPreview ({
  schema,
  autoFocus,
  forceValidation,
  onChange,
  value,
}: DefaultFieldProps<'form'>) {
  return (
    <schema.Input
      autoFocus={!!autoFocus}
      value={value}
      onChange={onChange}
      forceValidation={!!forceValidation}
    />
  )
}

function ObjectFieldPreview ({ schema, autoFocus, fields }: DefaultFieldProps<'object'>) {
  const firstFocusable = autoFocus ? findFocusableObjectFieldKey(schema) : undefined
  return (
    <Stack gap="xlarge">
      {Object.entries(fields).map(
        ([key, propVal]) =>
          isNonChildFieldPreviewProps(propVal) && (
            <FormValueContentFromPreviewProps
              autoFocus={key === firstFocusable}
              key={key}
              {...propVal}
            />
          )
      )}
    </Stack>
  )
}

function ConditionalFieldPreview ({
  schema,
  autoFocus,
  discriminant,
  onChange,
  value,
}: DefaultFieldProps<'conditional'>) {
  const schemaDiscriminant = schema.discriminant as FormField<string | boolean, unknown>
  return (
    <Stack gap="xlarge">
      {useMemo(
        () => (
          <schemaDiscriminant.Input
            autoFocus={!!autoFocus}
            value={discriminant}
            onChange={onChange}
            forceValidation={false}
          />
        ),
        [autoFocus, schemaDiscriminant, discriminant, onChange]
      )}
      {isNonChildFieldPreviewProps(value) && <FormValueContentFromPreviewProps {...value} />}
    </Stack>
  )
}

export type NonChildFieldComponentSchema =
  | FormField<any, any>
  | ObjectField
  | ConditionalField<FormField<any, any>, { [key: string]: ComponentSchema }>
  | RelationshipField<boolean>
  | ArrayField<ComponentSchema>

function isNonChildFieldPreviewProps (
  props: GenericPreviewProps<ComponentSchema, unknown>
): props is GenericPreviewProps<NonChildFieldComponentSchema, unknown> {
  return props.schema.kind !== 'child'
}

const fieldRenderers = {
  array: ArrayFieldPreview,
  relationship: RelationshipFieldPreview,
  child: () => null,
  form: FormFieldPreview,
  object: ObjectFieldPreview,
  conditional: ConditionalFieldPreview,
}

export const FormValueContentFromPreviewProps: MemoExoticComponent<
  (
    props: GenericPreviewProps<NonChildFieldComponentSchema, unknown> & {
      autoFocus?: boolean
      forceValidation?: boolean
    }
  ) => ReactElement
> = memo(function FormValueContentFromPreview (props) {
  const Comp = fieldRenderers[props.schema.kind]
  return <Comp {...(props as any)} />
})

const OrderableItemInForm = memo(function OrderableItemInForm (
  props: GenericPreviewProps<ComponentSchema, unknown> & {
    elementKey: string
    label: string
  }
) {
  const [modalState, setModalState] = useState<
    { state: 'open', value: unknown, forceValidation: boolean } | { state: 'closed' }
  >({ state: 'closed' })
  const onModalChange = useCallback(
    (cb: (value: unknown) => unknown) => {
      setModalState(state => {
        if (state.state === 'open') {
          return { state: 'open', forceValidation: state.forceValidation, value: cb(state.value) }
        }
        return state
      })
    },
    [setModalState]
  )
  return (
    <OrderableItem elementKey={props.elementKey}>
      <Stack gap="medium">
        <div css={{ display: 'flex', gap: 4 }}>
          <Stack across gap="xsmall" align="center" css={{ cursor: 'pointer' }}>
            <DragHandle />
          </Stack>
          <Button
            weight="none"
            onClick={() => {
              setModalState({
                state: 'open',
                value: previewPropsToValue(props),
                forceValidation: false,
              })
            }}
            css={{ flexGrow: 1, justifyContent: 'start' }}
          >
            <span css={{ fontSize: 16, fontWeight: 'bold', textAlign: 'start' }}>
              {props.label}
            </span>
          </Button>
          <RemoveButton />
        </div>
        {isNonChildFieldPreviewProps(props) && (
          <AlertDialog
            title={`Edit Item`}
            actions={{
              confirm: {
                action: () => {
                  if (modalState.state !== 'open') return
                  if (!clientSideValidateProp(props.schema, modalState.value)) {
                    setModalState(state => ({ ...state, forceValidation: true }))
                    return
                  }
                  setValueToPreviewProps(modalState.value, props)
                  setModalState({ state: 'closed' })
                },
                label: 'Done',
              },
              cancel: {
                action: () => {
                  setModalState({ state: 'closed' })
                },
                label: 'Cancel',
              },
            }}
            isOpen={modalState.state === 'open'}
          >
            {modalState.state === 'open' && (
              <ArrayFieldItemModalContent
                onChange={onModalChange}
                schema={props.schema}
                value={modalState.value}
              />
            )}
          </AlertDialog>
        )}
      </Stack>
    </OrderableItem>
  )
})

function ArrayFieldItemModalContent (props: {
  schema: NonChildFieldComponentSchema
  value: unknown
  onChange: (cb: (value: unknown) => unknown) => void
}) {
  const previewProps = useMemo(
    () => createGetPreviewProps(props.schema, props.onChange, () => undefined),
    [props.schema, props.onChange]
  )(props.value)
  return <FormValueContentFromPreviewProps {...previewProps} />
}

function findFocusableObjectFieldKey (schema: ObjectField): string | undefined {
  for (const [key, innerProp] of Object.entries(schema.fields)) {
    const childFocusable = canFieldBeFocused(innerProp)
    if (childFocusable) {
      return key
    }
  }
  return undefined
}

export function canFieldBeFocused (schema: ComponentSchema): boolean {
  if (
    schema.kind === 'array' ||
    schema.kind === 'conditional' ||
    schema.kind === 'form' ||
    schema.kind === 'relationship'
  ) {
    return true
  }
  if (schema.kind === 'child') {
    return false
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
