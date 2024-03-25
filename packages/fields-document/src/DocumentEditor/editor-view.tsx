/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core'
import { useState, useMemo, type ReactNode, useCallback, useContext } from 'react'
import { type Descendant, Editor, Element, Node, type NodeEntry, Range } from 'slate'
import { ReactEditor, Slate, useSlate, Editable } from 'slate-react'
import { type EditableProps } from 'slate-react/dist/components/editable'
import { type ComponentBlock } from '../component-blocks'
import { type DocumentFeatures } from '../views'
import { Toolbar } from './Toolbar'
import { type Relationships } from './relationship'
import { ToolbarStateProvider } from './toolbar-state'
import { ComponentBlockContext } from './component-blocks'
import { getPlaceholderTextForPropPath } from './component-blocks/utils'
import { renderLeaf } from './leaf'
import { renderElement } from './render-element'
import { getKeyDownHandler, styles } from './editor-model'
import { createDocumentEditor } from './editor-create-display'

export function DocumentEditor({
  onChange,
  value,
  componentBlocks,
  relationships,
  documentFeatures,
  initialExpanded = false,
  ...props
}: {
  onChange: undefined | ((value: Descendant[]) => void)
  value: Descendant[]
  componentBlocks: Record<string, ComponentBlock>
  relationships: Relationships
  documentFeatures: DocumentFeatures
  initialExpanded?: boolean
} & Omit<EditableProps, 'value' | 'onChange'>) {
  const { radii, colors, spacing, fields } = useTheme()
  const [expanded, setExpanded] = useState(initialExpanded)
  const editor = useMemo(
    () => createDocumentEditor(documentFeatures, componentBlocks, relationships),
    [documentFeatures, componentBlocks, relationships]
  )

  return (
    <div
      css={{
        border: `1px solid ${colors.border}`,
        borderRadius: radii.small,
      }}
    >
      <DocumentEditorProvider
        componentBlocks={componentBlocks}
        documentFeatures={documentFeatures}
        relationships={relationships}
        editor={editor}
        value={value}
        onChange={value => {
          onChange?.(value)
          // this fixes a strange issue in Safari where the selection stays inside of the editor
          // after a blur event happens but the selection is still in the editor
          // so the cursor is visually in the wrong place and it inserts text backwards
          const selection = window.getSelection()
          if (selection && !ReactEditor.isFocused(editor)) {
            const editorNode = ReactEditor.toDOMNode(editor, editor)
            if (selection.anchorNode === editorNode) {
              ReactEditor.focus(editor)
            }
          }
        }}
      >
        {useMemo(
          () =>
            onChange !== undefined && (
              <Toolbar
                documentFeatures={documentFeatures}
                viewState={{
                  expanded,
                  toggle: () => {
                    setExpanded(v => !v)
                  },
                }}
              />
            ),
          [expanded, documentFeatures, onChange]
        )}

        <DocumentEditorEditable
          css={[
            {
              borderRadius: 'inherit',
              background: fields.focus.inputBackground,
              borderColor: fields.inputBorderColor,
              paddingLeft: spacing.medium,
              paddingRight: spacing.medium,
              minHeight: 120,
              scrollbarGutter: 'stable',
              // the !important is necessary to override the width set by resizing as an inline style
              height: expanded ? 'auto !important' : 224,
              resize: expanded ? undefined : 'vertical',
              overflowY: 'auto',
            },
          ]}
          {...props}
          readOnly={onChange === undefined}
        />
        {
          // for debugging
          false && <Debugger />
        }
      </DocumentEditorProvider>
    </div>
  )
}
export function DocumentEditorProvider({
  children,
  editor,
  onChange,
  value,
  componentBlocks,
  documentFeatures,
  relationships,
}: {
  children: ReactNode
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  editor: Editor
  componentBlocks: Record<string, ComponentBlock>
  relationships: Relationships
  documentFeatures: DocumentFeatures
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const identity = useMemo(() => Math.random().toString(36), [editor])
  return (
    <Slate
      // this fixes issues with Slate crashing when a fast refresh occcurs
      key={identity}
      editor={editor}
      initialValue={value}
      onChange={value => {
        onChange(value)
        // this fixes a strange issue in Safari where the selection stays inside of the editor
        // after a blur event happens but the selection is still in the editor
        // so the cursor is visually in the wrong place and it inserts text backwards
        const selection = window.getSelection()
        if (selection && !ReactEditor.isFocused(editor)) {
          const editorNode = ReactEditor.toDOMNode(editor, editor)
          if (selection.anchorNode === editorNode) {
            ReactEditor.focus(editor)
          }
        }
      }}
    >
      <ToolbarStateProvider
        componentBlocks={componentBlocks}
        editorDocumentFeatures={documentFeatures}
        relationships={relationships}
      >
        {children}
      </ToolbarStateProvider>
    </Slate>
  )
}
export function DocumentEditorEditable(props: EditableProps) {
  const editor = useSlate()
  const componentBlocks = useContext(ComponentBlockContext)

  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor])

  return (
    <Editable
      decorate={useCallback(
        ([node, path]: NodeEntry<Node>) => {
          let decorations: Range[] = []
          if (node.type === 'component-block') {
            if (
              node.children.length === 1 &&
              Element.isElement(node.children[0]) &&
              node.children[0].type === 'component-inline-prop' &&
              node.children[0].propPath === undefined
            ) {
              return decorations
            }
            node.children.forEach((child, index) => {
              if (
                Node.string(child) === '' &&
                Element.isElement(child) &&
                (child.type === 'component-block-prop' || child.type === 'component-inline-prop') &&
                child.propPath !== undefined
              ) {
                const start = Editor.start(editor, [...path, index])
                const placeholder = getPlaceholderTextForPropPath(
                  child.propPath,
                  componentBlocks[node.component].schema,
                  node.props
                )
                if (placeholder) {
                  decorations.push({
                    placeholder,
                    anchor: start,
                    focus: start,
                  })
                }
              }
            })
          }
          return decorations
        },
        [editor, componentBlocks]
      )}
      css={styles}
      onKeyDown={onKeyDown}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      {...props}
    />
  )
}
export function Debugger() {
  const editor = useSlate()
  return (
    <pre>
      {JSON.stringify(
        {
          selection:
            editor.selection && Range.isCollapsed(editor.selection)
              ? editor.selection.anchor
              : editor.selection,
          marksWithoutCall: editor.marks,
          marks: Editor.marks(editor),
          children: editor.children,
        },
        null,
        2
      )}
    </pre>
  )
}
