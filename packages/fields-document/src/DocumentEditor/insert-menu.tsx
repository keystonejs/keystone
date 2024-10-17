/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Portal } from '@keystone-ui/core'
import { useControlledPopover } from '@keystone-ui/popover'
import {
  type ReactNode,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  type Text,
  Editor,
  Transforms,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { matchSorter } from 'match-sorter'
import scrollIntoView from 'scroll-into-view-if-needed'
import { ComponentBlockContext, insertComponentBlock } from './component-blocks'
import { type ComponentBlock } from './component-blocks/api-shared'
import { InlineDialog, ToolbarButton } from './primitives'
import { type Relationships } from './relationship-shared'
import { useDocumentFieldRelationships } from './relationship'
import { useToolbarState } from './toolbar-state'
import { type ToolbarState, } from './toolbar-state-shared'
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from './utils'
import { insertLayout } from './layouts-shared'

export * from './insert-menu-shared'

function noop () {}

type Option = {
  label: string
  keywords?: string[]
  insert: (editor: Editor) => void
}

function getOptions (
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
        insert (editor: Editor) {
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
        insert (editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'blockquote',
            children: [{ text: '' }],
          })
        },
      },
    !toolbarState.code.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.blockTypes.code && {
        label: 'Code block',
        insert (editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'code',
            children: [{ text: '' }],
          })
        },
      },
    !toolbarState.dividers.isDisabled &&
      toolbarState.editorDocumentFeatures.dividers && {
        label: 'Divider',
        insert (editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'divider',
            children: [{ text: '' }],
          })
        },
      },
    !!toolbarState.editorDocumentFeatures.layouts.length && {
      label: 'Layout',
      insert (editor) {
        insertLayout(editor, toolbarState.editorDocumentFeatures.layouts[0])
      },
    },
    !toolbarState.lists.ordered.isDisabled &&
      toolbarState.editorDocumentFeatures.formatting.listTypes.ordered && {
        label: 'Numbered List',
        keywords: ['ordered list'],
        insert (editor) {
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
        insert (editor) {
          insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
            type: 'unordered-list',
            children: [{ text: '' }],
          })
        },
      },
  ]
  return options.filter((x): x is Exclude<typeof x, boolean> => typeof x !== 'boolean')
}

function insertOption (editor: Editor, text: Text, option: Option) {
  const path = ReactEditor.findPath(editor, text)
  Transforms.delete(editor, {
    at: {
      focus: Editor.start(editor, path),
      anchor: Editor.end(editor, path),
    },
  })
  option.insert(editor)
}

// TODO: the changing width of the menu when searching isn't great
export function InsertMenu ({ children, text }: { children: ReactNode, text: Text }) {
  const toolbarState = useToolbarState()
  const {
    editor,
    relationships: { isDisabled: relationshipsDisabled },
  } = toolbarState
  const { dialog, trigger } = useControlledPopover(
    { isOpen: true, onClose: noop },
    { placement: 'bottom-start' }
  )
  const componentBlocks = useContext(ComponentBlockContext)
  const relationships = useDocumentFieldRelationships()
  const options = matchSorter(
    getOptions(toolbarState, componentBlocks, relationshipsDisabled ? {} : relationships),
    text.text.slice(1),
    {
      keys: ['label', 'keywords'],
    }
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  if (options.length && selectedIndex >= options.length) {
    setSelectedIndex(0)
  }

  const stateRef = useRef({ selectedIndex, options, text })

  useEffect(() => {
    stateRef.current = { selectedIndex, options, text }
  })

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = dialogRef.current?.children?.[selectedIndex]
    if (dialogRef.current && element) {
      scrollIntoView(element, {
        scrollMode: 'if-needed',
        boundary: dialogRef.current,
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  useEffect(() => {
    const domNode = ReactEditor.toDOMNode(editor, editor)
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      switch (event.key) {
        case 'ArrowDown': {
          if (stateRef.current.options.length) {
            event.preventDefault()
            setSelectedIndex(
              stateRef.current.selectedIndex === stateRef.current.options.length - 1
                ? 0
                : stateRef.current.selectedIndex + 1
            )
          }
          return
        }
        case 'ArrowUp': {
          if (stateRef.current.options.length) {
            event.preventDefault()
            setSelectedIndex(
              stateRef.current.selectedIndex === 0
                ? stateRef.current.options.length - 1
                : stateRef.current.selectedIndex - 1
            )
          }
          return
        }
        case 'Enter': {
          const option = stateRef.current.options[stateRef.current.selectedIndex]
          if (option) {
            insertOption(editor, stateRef.current.text, option)
            event.preventDefault()
          }
          return
        }
        case 'Escape': {
          const path = ReactEditor.findPath(editor, stateRef.current.text)
          Transforms.unsetNodes(editor, 'insertMenu', { at: path })
          event.preventDefault()
          return
        }
      }
    }
    domNode.addEventListener('keydown', listener)
    return () => {
      domNode.removeEventListener('keydown', listener)
    }
  }, [editor])
  const DIALOG_HEIGHT = 300
  return (
    <Fragment>
      <span {...trigger.props} css={{ color: 'blue' }} ref={trigger.ref}>
        {children}
      </span>
      <Portal>
        <InlineDialog
          contentEditable={false}
          {...dialog.props}
          css={{
            display: options.length ? undefined : 'none',
            userSelect: 'none',
            maxHeight: DIALOG_HEIGHT,
            zIndex: 3,
          }}
          ref={dialog.ref}
        >
          <div ref={dialogRef} css={{ overflowY: 'auto', maxHeight: DIALOG_HEIGHT - 8 * 2 }}>
            {options.map((option, index) => (
              <ToolbarButton
                key={option.label}
                isPressed={index === selectedIndex}
                onMouseEnter={() => {
                  setSelectedIndex(index)
                }}
                onMouseDown={event => {
                  event.preventDefault()
                  insertOption(editor, text, option)
                }}
              >
                {option.label}
              </ToolbarButton>
            ))}
          </div>
        </InlineDialog>
      </Portal>
    </Fragment>
  )
}
