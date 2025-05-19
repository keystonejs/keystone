import { ActionButton, ButtonGroup, Button } from '@keystar/ui/button'
import { DialogContainer, Dialog, useDialogContainer } from '@keystar/ui/dialog'
import { FieldDescription, FieldLabel, FieldMessage } from '@keystar/ui/field'
import { VStack } from '@keystar/ui/layout'
import { MenuTrigger, Menu, Item } from '@keystar/ui/menu'
import { Content } from '@keystar/ui/slots'
import { Heading } from '@keystar/ui/typography'
import { useLocalizedStringFormatter } from '@react-aria/i18n'
import { useField } from '@react-aria/label'
import { useId, useState, useMemo } from 'react'

import type {
  ArrayField,
  BasicFormField,
  ComponentSchema,
  ConditionalField,
  GenericPreviewProps,
} from '../../api'
import { clientSideValidateProp } from '../../errors'
import type { ExtraFieldInputProps } from '../../form-from-preview'
import { FormValueContentFromPreviewProps } from '../../form-from-preview'
import { valueToUpdater } from '../../get-value'
import { ArrayFieldListView, useArrayFieldValidationMessage } from '../array/ui'
import l10nMessages from '../../../l10n'
import { createGetPreviewProps } from '../../preview-props'
import { getInitialPropsValue } from '../../initial-values'

type BlocksPreviewProps = GenericPreviewProps<
  ArrayField<
    ConditionalField<
      BasicFormField<string> & {
        options: readonly { label: string; value: string | boolean }[]
      },
      {
        [_ in string]: ComponentSchema
      }
    >
  >,
  unknown
>
export function BlocksFieldInput(props: BlocksPreviewProps & ExtraFieldInputProps) {
  const [modalState, setModalState] = useState<
    | { kind: 'closed' }
    | { kind: 'new'; discriminant: string | boolean }
    | { kind: 'edit'; idx: number }
  >({ kind: 'closed' })

  const dismiss = () => {
    setModalState({ kind: 'closed' })
  }

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
      <MenuTrigger>
        <ActionButton alignSelf="start">Add</ActionButton>
        <Menu
          items={props.schema.element.discriminant.options}
          onAction={discriminant => {
            const val = props.schema.element.discriminant.options.find(
              x => x.value.toString() === discriminant.toString()
            )?.value
            if (val === undefined) return
            setModalState({
              kind: 'new',
              discriminant: val,
            })
          }}
        >
          {item => <Item key={item.value.toString()}>{item.label}</Item>}
        </Menu>
      </MenuTrigger>
      <ArrayFieldListView
        {...props}
        aria-label={props.schema.label}
        onOpenItem={idx => {
          setModalState({
            kind: 'edit',
            idx,
          })
        }}
      />
      {errorMessage && <FieldMessage {...errorMessageProps}>{errorMessage}</FieldMessage>}

      <DialogContainer onDismiss={dismiss}>
        {(() => {
          if (modalState.kind === 'closed') {
            return null
          }
          if (modalState.kind === 'edit') {
            const idx = modalState.idx
            const previewProps = props.elements[idx].value
            const { discriminant } = props.elements[idx]
            return (
              <Dialog>
                <Heading>
                  Edit{' '}
                  {
                    props.schema.element.discriminant.options.find(x => x.value === discriminant)
                      ?.label
                  }
                </Heading>
                <BlocksEditItemModalContent
                  formId={formId}
                  onClose={dismiss}
                  previewProps={previewProps}
                  modalStateIndex={idx}
                />
                <ButtonGroup>
                  <Button form={formId} prominence="high" type="submit">
                    Done
                  </Button>
                </ButtonGroup>
              </Dialog>
            )
          }
          const discriminant = modalState.discriminant
          return (
            <Dialog>
              <Heading>
                Add{' '}
                {
                  props.schema.element.discriminant.options.find(x => x.value === discriminant)
                    ?.label
                }
              </Heading>
              <Content>
                <BlocksAddItemModalContent
                  discriminant={discriminant}
                  formId={formId}
                  previewProps={props}
                />
              </Content>
              <ButtonGroup>
                <Button onPress={dismiss}>{stringFormatter.format('cancel')}</Button>
                <Button form={formId} prominence="high" type="submit">
                  {stringFormatter.format('add')}
                </Button>
              </ButtonGroup>
            </Dialog>
          )
        })()}
      </DialogContainer>
    </VStack>
  )
}

function BlocksEditItemModalContent(props: {
  formId: string
  onClose: () => void
  previewProps: GenericPreviewProps<ComponentSchema, unknown>
  modalStateIndex: number
}) {
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
        <FormValueContentFromPreviewProps autoFocus {...props.previewProps} />
      </VStack>
    </Content>
  )
}

function BlocksAddItemModalContent(props: {
  previewProps: BlocksPreviewProps
  discriminant: string | boolean
  formId: string
}) {
  const schema = props.previewProps.schema.element.values[props.discriminant.toString()]
  const [value, setValue] = useState(() => getInitialPropsValue(schema))
  const [forceValidation, setForceValidation] = useState(false)
  const previewProps = useMemo(
    () => createGetPreviewProps(schema, setValue as any, () => undefined),
    [schema, setValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return (
    <VStack
      id={props.formId}
      elementType="form"
      onSubmit={event => {
        if (event.target !== event.currentTarget) return
        event.preventDefault()
        if (!clientSideValidateProp(schema, value)) {
          setForceValidation(true)
          return
        }
        props.previewProps.onChange([
          ...props.previewProps.elements.map(x => ({ key: x.key })),
          {
            key: undefined,
            value: valueToUpdater(
              { value, discriminant: props.discriminant },
              props.previewProps.schema.element
            ),
          },
        ])
        dismiss()
      }}
      gap="xxlarge"
    >
      <FormValueContentFromPreviewProps
        forceValidation={forceValidation}
        autoFocus
        {...(previewProps as any)}
      />
    </VStack>
  )
}
