import { ActionButton, Button, ButtonGroup } from '@keystar/ui/button'
import { Dialog, DialogContainer } from '@keystar/ui/dialog'
import type { ItemDropTarget } from '@keystar/ui/drag-and-drop'
import { move, useDragAndDrop } from '@keystar/ui/drag-and-drop'
import { FieldDescription, FieldLabel, FieldMessage } from '@keystar/ui/field'
import { Icon } from '@keystar/ui/icon'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'
import { VStack } from '@keystar/ui/layout'
import { Item, ListView } from '@keystar/ui/list-view'
import { Content } from '@keystar/ui/slots'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'
import { useLocalizedStringFormatter } from '@react-aria/i18n'
import { useField } from '@react-aria/label'
import type { Key } from 'react'
import { useId, useMemo, useState } from 'react'

import l10nMessages from '../../../l10n'
import { pluralize } from '../../../pluralize'

import type { ArrayField, ComponentSchema, GenericPreviewProps } from '../../api'
import { clientSideValidateProp } from '../../errors'
import type { ExtraFieldInputProps } from '../../form-from-preview'
import { FormValueContentFromPreviewProps } from '../../form-from-preview'
import { valueToUpdater } from '../../get-value'
import { getInitialPropsValue } from '../../initial-values'
import { createGetPreviewProps } from '../../preview-props'
import { useEventCallback } from '../../../editor/utils'

export function ArrayFieldInput<Element extends ComponentSchema>(
  props: GenericPreviewProps<ArrayField<Element>, unknown> & ExtraFieldInputProps
) {
  const minLength = props.schema.validation?.length?.min ?? 0
  const formId = useId()
  const stringFormatter = useLocalizedStringFormatter(l10nMessages)
  const errorMessage = useArrayFieldValidationMessage(props)
  const {
    descriptionProps,
    errorMessageProps,
    fieldProps: groupProps,
    labelProps,
  } = useField({
    description: props.schema.description,
    errorMessage: errorMessage,
    isInvalid: !!errorMessage,
    label: props.schema.label,
    labelElementType: 'span',
  })

  const [modalState, setModalState] = useState<
    { state: 'edit'; index: number } | { state: 'new' } | { state: 'closed' }
  >({ state: 'closed' })

  return (
    <VStack gap="medium" role="group" minWidth={0} {...groupProps}>
      <FieldLabel
        elementType="span"
        isRequired={minLength > 0}
        supplementRequiredState
        {...labelProps}
      >
        {props.schema.label}
      </FieldLabel>
      {props.schema.description && (
        <FieldDescription {...descriptionProps}>{props.schema.description}</FieldDescription>
      )}
      <ActionButton
        autoFocus={props.autoFocus}
        onPress={() => {
          setModalState({ state: 'new' })
        }}
        alignSelf="start"
      >
        {stringFormatter.format('add')}
      </ActionButton>
      <ArrayFieldListView
        {...props}
        aria-label={props.schema.label}
        onOpenItem={idx => {
          setModalState({ state: 'edit', index: idx })
        }}
      />
      {errorMessage && <FieldMessage {...errorMessageProps}>{errorMessage}</FieldMessage>}

      <DialogContainer
        onDismiss={() => {
          setModalState({ state: 'closed' })
        }}
      >
        {(() => {
          if (modalState.state === 'new') {
            return (
              <ArrayFieldAddItemModalContent
                formId={formId}
                onClose={() => {
                  setModalState({ state: 'closed' })
                }}
                previewProps={props}
              />
            )
          }
          if (modalState.state !== 'edit') return
          return (
            <Dialog>
              <Heading>Edit item</Heading>
              <ArrayEditItemModalContent
                formId={formId}
                modalStateIndex={modalState.index}
                onClose={() => {
                  setModalState({ state: 'closed' })
                }}
                previewProps={props}
              />
              <ButtonGroup>
                <Button form={formId} prominence="high" type="submit">
                  Done
                </Button>
              </ButtonGroup>
            </Dialog>
          )
        })()}
      </DialogContainer>
    </VStack>
  )
}

function ArrayFieldAddItemModalContent(props: {
  previewProps: GenericPreviewProps<ArrayField<ComponentSchema>, unknown>
  formId: string
  onClose: () => void
}) {
  const [forceValidation, setForceValidation] = useState(false)
  const stringFormatter = useLocalizedStringFormatter(l10nMessages)

  const [value, setValue] = useState(() => getInitialPropsValue(props.previewProps.schema.element))

  const previewProps = useMemo(
    () => createGetPreviewProps(props.previewProps.schema.element, setValue, () => undefined),
    [props.previewProps.schema.element, setValue]
  )(value)
  return (
    <Dialog>
      <Heading>Add item</Heading>
      <Content>
        <VStack
          id={props.formId}
          elementType="form"
          onSubmit={event => {
            if (event.target !== event.currentTarget) return
            event.preventDefault()
            if (!clientSideValidateProp(props.previewProps.schema.element, value)) {
              setForceValidation(true)
              return
            }
            props.previewProps.onChange([
              ...props.previewProps.elements.map(x => ({
                key: x.key,
              })),
              {
                key: undefined,
                value: valueToUpdater(value, props.previewProps.schema.element),
              },
            ])
            props.onClose()
          }}
          gap="xxlarge"
        >
          <FormValueContentFromPreviewProps
            autoFocus
            {...previewProps}
            forceValidation={forceValidation}
          />
        </VStack>
      </Content>
      <ButtonGroup>
        <Button
          onPress={() => {
            props.onClose()
          }}
        >
          {stringFormatter.format('cancel')}
        </Button>
        <Button form={props.formId} prominence="high" type="submit">
          {stringFormatter.format('add')}
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}

function ArrayEditItemModalContent(props: {
  formId: string
  onClose: () => void
  previewProps: GenericPreviewProps<ArrayField<ComponentSchema>, unknown>
  modalStateIndex: number
}) {
  const { key, ...propsWithoutKey } = props.previewProps.elements[props.modalStateIndex]

  return (
    <Content>
      <VStack
        id={props.formId}
        elementType="form"
        onSubmit={event => {
          if (event.target !== event.currentTarget) return
          event.preventDefault()
          props.onClose()
        }}
        gap="xxlarge"
      >
        <FormValueContentFromPreviewProps autoFocus {...propsWithoutKey} />
      </VStack>
    </Content>
  )
}

// TODO: l10n
export function useArrayFieldValidationMessage<Element extends ComponentSchema>(
  props: GenericPreviewProps<ArrayField<Element>, unknown> & ExtraFieldInputProps
) {
  const { elements, forceValidation, schema } = props
  const minLength = schema.validation?.length?.min
  const maxLength = schema.validation?.length?.max

  return useMemo(() => {
    if (forceValidation) {
      if (minLength && elements.length < minLength) {
        return `Must have at least ${pluralize(minLength, {
          singular: 'item',
        })}.`
      } else if (maxLength && elements.length > maxLength) {
        return `Must have at most ${pluralize(maxLength, {
          singular: 'item',
        })}.`
      }
    }
  }, [elements.length, forceValidation, maxLength, minLength])
}

export function ArrayFieldListView<Element extends ComponentSchema>(
  props: GenericPreviewProps<ArrayField<Element>, unknown> &
    ExtraFieldInputProps & {
      'aria-label': string
      onOpenItem: (index: number) => void
    }
) {
  let onMove = (keys: Key[], target: ItemDropTarget) => {
    const targetIndex = props.elements.findIndex(x => x.key === target.key)
    if (targetIndex === -1) return
    const allKeys = props.elements.map(x => ({ key: x.key }))
    const indexToMoveTo = target.dropPosition === 'before' ? targetIndex : targetIndex + 1
    const indices = keys.map(key => allKeys.findIndex(x => x.key === key))
    props.onChange(move(allKeys, indices, indexToMoveTo))
  }

  const dragType = useMemo(() => Math.random().toString(36), [])

  let { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      // Use a drag type so the items can only be reordered within this list
      // and not dragged elsewhere.
      return [...keys].map(key => {
        key = JSON.stringify(key)
        return {
          [dragType]: key,
          'text/plain': key,
        }
      })
    },
    getAllowedDropOperations() {
      return ['move', 'cancel']
    },
    async onDrop(e) {
      if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
        let keys = []
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType))
              keys.push(key)
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain')
              keys = key.split('\n').map(val => val.replaceAll('"', ''))
            }
          }
        }
        onMove(keys, e.target)
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel'
      }

      return 'move'
    },
  })
  const onRemoveKey = useEventCallback((key: string) => {
    props.onChange(props.elements.map(x => ({ key: x.key })).filter(val => val.key !== key))
  })

  const stringFormatter = useLocalizedStringFormatter(l10nMessages)

  return (
    <ListView
      aria-label={props['aria-label']}
      items={props.elements}
      dragAndDropHooks={dragAndDropHooks}
      height={props.elements.length ? undefined : 'scale.2000'}
      selectionMode="none"
      renderEmptyState={arrayFieldEmptyState}
      onAction={key => {
        const idx = props.elements.findIndex(x => x.key === key)
        if (idx === -1) return
        props.onOpenItem(idx)
      }}
    >
      {item => {
        const label = props.schema.itemLabel?.(item) || `Item ${props.elements.indexOf(item) + 1}`
        return (
          <Item key={item.key} textValue={label}>
            <Text>{label}</Text>
            <TooltipTrigger placement="start">
              <ActionButton
                onPress={() => {
                  onRemoveKey(item.key)
                }}
              >
                <Icon src={trash2Icon} />
              </ActionButton>
              <Tooltip>{stringFormatter.format('delete')}</Tooltip>
            </TooltipTrigger>
          </Item>
        )
      }}
    </ListView>
  )
}

function arrayFieldEmptyState() {
  return (
    <VStack gap="large" alignItems="center" justifyContent="center" height="100%" padding="regular">
      <Text elementType="h3" align="center" color="neutralSecondary" size="large" weight="medium">
        Empty list
      </Text>
      <Text align="center" color="neutralTertiary">
        Add the first item to see it here.
      </Text>
    </VStack>
  )
}
