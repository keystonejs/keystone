import { Icon } from '@keystar/ui/icon'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'
import {
  type ReactNode,
  useMemo,
  useState,
  useCallback,
  Fragment,
  forwardRef,
  type PropsWithChildren,
  type Ref,
  useId,
} from 'react'
import { type RenderElementProps, useSelected } from 'slate-react'
import { ActionButton, Button, ButtonGroup } from '@keystar/ui/button'
import { Heading, Text } from '@keystar/ui/typography'
import {
  type PreviewPropsForToolbar,
  type ObjectField,
  type ComponentSchema,
  type ComponentBlock,
  NotEditable,
} from './api'
import { clientSideValidateProp } from './utils'
import type { GenericPreviewProps } from './api'
import {
  FormValueContentFromPreviewProps,
  previewPropsOnChange,
  previewPropsToValue,
} from './form-from-preview'
import { DialogContainer, Dialog } from '@keystar/ui/dialog'
import { FieldMessage } from '@keystar/ui/field'
import { Flex } from '@keystar/ui/layout'
import { Content } from '@keystar/ui/slots'
import { css, tokenSchema } from '@keystar/ui/style'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { blockElementSpacing } from '../utils-hooks'
import { createGetPreviewProps } from './preview-props'

export function ChromefulComponentBlockElement(props: {
  children: ReactNode
  renderedBlock: ReactNode
  componentBlock: ComponentBlock & { chromeless?: false }
  previewProps: PreviewPropsForToolbar<ObjectField<Record<string, ComponentSchema>>>
  elementProps: Record<string, unknown>
  onRemove: () => void
  attributes: RenderElementProps['attributes']
}) {
  const selected = useSelected()

  const isValid = useMemo(
    () =>
      clientSideValidateProp(
        { kind: 'object', fields: props.componentBlock.schema },
        props.elementProps
      ),

    [props.componentBlock, props.elementProps]
  )

  const [editMode, setEditMode] = useState(false)
  const onCloseEditMode = useCallback(() => {
    setEditMode(false)
  }, [])
  const onShowEditMode = useCallback(() => {
    setEditMode(true)
  }, [])

  const ChromefulToolbar = props.componentBlock.toolbar ?? DefaultToolbarWithChrome
  return (
    <BlockPrimitive selected={selected} {...props.attributes}>
      <Flex gap="medium" direction="column">
        <NotEditable>
          <Text casing="uppercase" color="neutralSecondary" weight="medium" size="small">
            {props.componentBlock.label}
          </Text>
        </NotEditable>
        <Fragment>
          {props.renderedBlock}
          <ChromefulToolbar
            isValid={isValid}
            onRemove={props.onRemove}
            props={props.previewProps}
            onShowEditMode={onShowEditMode}
          />
          <DialogContainer onDismiss={() => onCloseEditMode()}>
            {(() => {
              if (!editMode) {
                return
              }
              return (
                <Dialog>
                  <Heading>Edit {props.componentBlock.label}</Heading>
                  <FormValue props={props.previewProps} onClose={onCloseEditMode} />
                </Dialog>
              )
            })()}
          </DialogContainer>
        </Fragment>
      </Flex>
    </BlockPrimitive>
  )
}

/**
 * Wrap block content, delimiting it from surrounding content, and provide a
 * focus indicator because the cursor may not be present.
 */
const BlockPrimitive = forwardRef(function BlockPrimitive(
  {
    children,
    selected,
    ...attributes
  }: PropsWithChildren<Omit<RenderElementProps['attributes'], 'ref'> & { selected: boolean }>,
  ref: Ref<any>
) {
  return (
    <div
      {...attributes}
      ref={ref}
      className={css(blockElementSpacing, {
        position: 'relative',
        paddingInlineStart: tokenSchema.size.space.xlarge,
        marginBottom: tokenSchema.size.space.xlarge,

        '::before': {
          display: 'block',
          content: '" "',
          backgroundColor: selected
            ? tokenSchema.color.alias.borderSelected
            : tokenSchema.color.alias.borderIdle,
          borderRadius: 4,
          width: 4,
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
        },
      })}
    >
      {children}
    </div>
  )
})

function DefaultToolbarWithChrome({
  onShowEditMode,
  onRemove,
  isValid,
}: {
  onShowEditMode(): void
  onRemove(): void
  props: any
  isValid: boolean
}) {
  return (
    <NotEditable>
      <Flex direction="column" gap="medium">
        <Flex alignItems="center" gap="regular" UNSAFE_style={{ userSelect: 'none' }}>
          <ActionButton onPress={() => onShowEditMode()}>Edit</ActionButton>
          <TooltipTrigger>
            <ActionButton prominence="low" onPress={onRemove}>
              <Icon src={trash2Icon} />
            </ActionButton>
            <Tooltip tone="critical">Delete</Tooltip>
          </TooltipTrigger>
        </Flex>
        {!isValid && <FieldMessage>Contains invalid fields. Please edit.</FieldMessage>}
      </Flex>
    </NotEditable>
  )
}

function FormValue({
  onClose,
  props,
}: {
  props: GenericPreviewProps<ComponentSchema, unknown>
  onClose(): void
}) {
  const formId = useId()
  const [forceValidation, setForceValidation] = useState(false)
  const [state, setState] = useState(() => previewPropsToValue(props))
  const previewProps = useMemo(
    () => createGetPreviewProps(props.schema, setState, () => undefined),
    [props.schema]
  )(state)

  return (
    <>
      <Content>
        <Flex
          id={formId}
          elementType="form"
          onSubmit={event => {
            if (event.target !== event.currentTarget) return
            event.preventDefault()
            if (!clientSideValidateProp(props.schema, state)) {
              setForceValidation(true)
            } else {
              previewPropsOnChange(state, props)
              onClose()
            }
          }}
          direction="column"
          gap="xxlarge"
        >
          <FormValueContentFromPreviewProps {...previewProps} forceValidation={forceValidation} />
        </Flex>
      </Content>
      <ButtonGroup>
        <Button onPress={onClose}>Cancel</Button>
        <Button form={formId} prominence="high" type="submit">
          Done
        </Button>
      </ButtonGroup>
    </>
  )
}
