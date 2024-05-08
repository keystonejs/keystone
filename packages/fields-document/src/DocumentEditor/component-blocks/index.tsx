/** @jsxRuntime classic */
/** @jsx jsx */

import {
  Fragment,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { Editor, Transforms } from 'slate'
import {
  type RenderElementProps,
  ReactEditor,
  useFocused,
  useSelected,
  useSlateStatic as useStaticEditor
} from 'slate-react'

import { jsx, useTheme } from '@keystone-ui/core'

import { ToolbarButton } from '../primitives'
import { type ComponentBlock } from './api-shared'
import {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading,
} from '../utils'
import {
  useElementWithSetNodes,
  useEventCallback,
} from '../utils-hooks'
import { getInitialValue } from './initial-values'
import { createGetPreviewProps } from './preview-props'
import { updateComponentBlockElementProps } from './update-element'
import { ComponentBlockRender } from './component-block-render'
import { ChromefulComponentBlockElement } from './chromeful-element'
import { ChromelessComponentBlockElement } from './chromeless-element'

export { withComponentBlocks } from './with-component-blocks'

export const ComponentBlockContext = createContext<Record<string, ComponentBlock>>({})

export function ComponentInlineProp (props: RenderElementProps) {
  return <span {...props.attributes}>{props.children}</span>
}

export function insertComponentBlock (
  editor: Editor,
  componentBlocks: Record<string, ComponentBlock>,
  componentBlock: string
) {
  const node = getInitialValue(componentBlock, componentBlocks[componentBlock])
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, node)

  const componentBlockEntry = Editor.above(editor, {
    match: node => node.type === 'component-block',
  })

  if (componentBlockEntry) {
    const start = Editor.start(editor, componentBlockEntry[1])
    Transforms.setSelection(editor, { anchor: start, focus: start })
  }
}

export function BlockComponentsButtons ({ onClose }: { onClose: () => void }) {
  const editor = useStaticEditor()
  const blockComponents = useContext(ComponentBlockContext)!
  return (
    <Fragment>
      {Object.keys(blockComponents).map(key => (
        <ToolbarButton
          key={key}
          onMouseDown={event => {
            event.preventDefault()
            insertComponentBlock(editor, blockComponents, key)
            onClose()
          }}
        >
          {blockComponents[key].label}
        </ToolbarButton>
      ))}
    </Fragment>
  )
}

export function ComponentBlocksElement ({
  attributes,
  children,
  element: __elementToGetPath,
}: RenderElementProps & { element: { type: 'component-block' } }) {
  const editor = useStaticEditor()
  const focused = useFocused()
  const selected = useSelected()
  const [currentElement, setElement] = useElementWithSetNodes(editor, __elementToGetPath)
  const { spacing } = useTheme()
  const blockComponents = useContext(ComponentBlockContext)!
  const componentBlock = blockComponents[currentElement.component] as ComponentBlock | undefined

  const elementToGetPathRef = useRef({ __elementToGetPath, currentElement })

  useEffect(() => {
    elementToGetPathRef.current = { __elementToGetPath, currentElement }
  })

  const onRemove = useEventCallback(() => {
    const path = ReactEditor.findPath(editor, __elementToGetPath)
    Transforms.removeNodes(editor, { at: path })
  })

  const onPropsChange = useCallback(
    (cb: (prevProps: Record<string, unknown>) => Record<string, unknown>) => {
      const prevProps = elementToGetPathRef.current.currentElement.props
      updateComponentBlockElementProps(
        editor,
        componentBlock!,
        prevProps,
        cb(prevProps),
        ReactEditor.findPath(editor, elementToGetPathRef.current.__elementToGetPath),
        setElement
      )
    },
    [setElement, componentBlock, editor]
  )

  const getToolbarPreviewProps = useMemo(() => {
    if (!componentBlock) {
      return () => {
        throw new Error('expected component block to exist when called')
      }
    }
    return createGetPreviewProps(
      { kind: 'object', fields: componentBlock.schema },
      onPropsChange,
      () => undefined
    )
  }, [componentBlock, onPropsChange])

  if (!componentBlock) {
    return (
      <div css={{ border: 'red 4px solid', padding: spacing.medium }}>
        <pre contentEditable={false} css={{ userSelect: 'none' }}>
          {`The block "${currentElement.component}" no longer exists.

Props:

${JSON.stringify(currentElement.props, null, 2)}

Content:`}
        </pre>
        {children}
      </div>
    )
  }

  const toolbarPreviewProps = getToolbarPreviewProps(currentElement.props)

  const renderedBlock = (
    <ComponentBlockRender
      children={children}
      componentBlock={componentBlock}
      element={currentElement}
      onChange={onPropsChange}
    />
  )

  return componentBlock.chromeless ? (
    <ChromelessComponentBlockElement
      attributes={attributes}
      renderedBlock={renderedBlock}
      componentBlock={componentBlock}
      isOpen={focused && selected}
      onRemove={onRemove}
      previewProps={toolbarPreviewProps}
    />
  ) : (
    <ChromefulComponentBlockElement
      attributes={attributes}
      children={children}
      componentBlock={componentBlock}
      onRemove={onRemove}
      previewProps={toolbarPreviewProps}
      renderedBlock={renderedBlock}
      elementProps={currentElement.props}
    />
  )
}
