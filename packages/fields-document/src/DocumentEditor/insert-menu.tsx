import { type ReactNode, Fragment, useContext, useRef } from 'react'
import { type Text, Editor, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { matchSorter } from 'match-sorter'
import { ComponentBlockContext, insertComponentBlock } from './component-blocks/index.tsx'
import type { ComponentBlock } from './component-blocks/api-shared.ts'
import type { Relationships } from './relationship-shared.ts'
import { useDocumentFieldRelationships } from './relationship.tsx'
import { useToolbarState } from './toolbar-state.tsx'
import type { ToolbarState } from './toolbar-state-shared.ts'
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from './utils.ts'
import { insertLayout } from './layouts-shared.ts'

import { EditorListbox, EditorListboxItem } from '@keystar/ui/editor'
import { Popover } from '@keystar/ui/overlays'
import { css, tokenSchema } from '@keystar/ui/style'

export * from './insert-menu-shared.ts'

type Option = {
  label: string
  keywords?: string[]
  insert: (editor: Editor) => void
}

function getOptions(
  toolbarState: ToolbarState,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
): Option[] {
  const options: (Option | boolean)[] = [
    ...Object.entries(relationships).map(([relationship, { label }]) => ({
      label,
      insert: (editor: Editor) => {
        Transforms.insertNodes(editor, {
          type: 'relationship',
          relationship,
          data: null,
          children: [{ text: '' }],
        })
      },
    })),
    ...Object.keys(componentBlocks).map(key => ({
      label: componentBlocks[key].label,
      insert: (editor: Editor) => {
        insertComponentBlock(editor, componentBlocks, key)
      },
    })),
    ...toolbarState.textStyles.allowedHeadingLevels
      .filter(a => toolbarState.editorDocumentFeatures.formatting.headingLevels.includes(a))
      .map(level => ({
        label: `Heading ${level}`,
        insert(editor: Editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'heading',
            level,
            children: [{ text: '' }],
          })
        },
      })),
    !toolbarState.blockquote.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.blockTypes.blockquote && {
        label: 'Blockquote',
        insert(editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'blockquote',
            children: [{ text: '' }],
          })
        },
      },
    !toolbarState.code.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.blockTypes.code && {
        label: 'Code block',
        insert(editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'code',
            children: [{ text: '' }],
          })
        },
      },
    !toolbarState.dividers.isDisabled &&
      toolbarState.editorDocumentFeatures.dividers && {
        label: 'Divider',
        insert(editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'divider',
            children: [{ text: '' }],
          })
        },
      },
    !!toolbarState.editorDocumentFeatures.layouts.length && {
      label: 'Layout',
      insert(editor) {
        insertLayout(editor, toolbarState.editorDocumentFeatures.layouts[0])
      },
    },
    !toolbarState.lists.ordered.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.listTypes.ordered && {
        label: 'Numbered List',
        keywords: ['ordered list'],
        insert(editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'ordered-list',
            children: [{ text: '' }],
          })
        },
      },
    !toolbarState.lists.unordered.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.listTypes.unordered && {
        label: 'Bullet List',
        keywords: ['unordered list'],
        insert(editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'unordered-list',
            children: [{ text: '' }],
          })
        },
      },
  ]
  return options.filter((x): x is Exclude<typeof x, boolean> => typeof x !== 'boolean')
}

function insertOption(editor: Editor, text: Text, option: Option) {
  const path = ReactEditor.findPath(editor, text)
  Transforms.delete(editor, {
    at: {
      focus: Editor.start(editor, path),
      anchor: Editor.end(editor, path),
    },
  })
  option.insert(editor)
}

export function InsertMenu({ children, text }: { children: ReactNode; text: Text }) {
  const toolbarState = useToolbarState()
  const { editor } = toolbarState
  const componentBlocks = useContext(ComponentBlockContext)
  const relationships = useDocumentFieldRelationships()

  const options = matchSorter(
    getOptions(toolbarState, componentBlocks, relationships),
    text.text.slice(1),
    {
      keys: ['label', 'keywords'],
    }
  ).map((option, index) => ({ ...option, index }))

  const triggerRef = useRef<HTMLSpanElement>(null)
  return (
    <Fragment>
      <span
        className={css({
          color: tokenSchema.color.foreground.accent,
          fontWeight: tokenSchema.typography.fontWeight.medium,
        })}
        ref={triggerRef}
      >
        {children}
      </span>
      <Popover
        width="alias.singleLineWidth"
        placement="bottom start"
        isNonModal
        hideArrow
        isOpen
        triggerRef={triggerRef}
      >
        <div className={css({ overflow: 'scroll', maxHeight: 300 })}>
          <EditorListbox
            aria-label="Insert block"
            items={options}
            onAction={key => {
              insertOption(editor, text, options[key as number])
            }}
          >
            {item => <EditorListboxItem id={item.index}>{item.label}</EditorListboxItem>}
          </EditorListbox>
        </div>
      </Popover>
    </Fragment>
  )
}
