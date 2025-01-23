import React, {
  type ReactNode,
  Fragment,
  useContext,
  useEffect,
  useRef
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
import { type Relationships } from './relationship-shared'
import { useDocumentFieldRelationships } from './relationship'
import { useToolbarState } from './toolbar-state'
import { type ToolbarState, } from './toolbar-state-shared'
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from './utils'
import { insertLayout } from './layouts-shared'

import { useOverlayTrigger } from '@react-aria/overlays'
import { useListState } from '@react-stately/list'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Popover } from '@keystar/ui/overlays'
import { Item, ListBoxBase, useListBoxLayout } from '@keystar/ui/listbox'
import { css, tokenSchema } from '@keystar/ui/style'


export * from './insert-menu-shared'

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

export function InsertMenu ({
  children,
  text,
}: {
  children: ReactNode
  text: Text
}) {
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

  const stateRef = useRef({ options, text })

  useEffect(() => {
    stateRef.current = { options, text }
  })

  const listenerRef = useRef((_event: KeyboardEvent) => {})
  useEffect(() => {
    listenerRef.current = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      switch (event.key) {
        case 'ArrowDown': {
          if (stateRef.current.options.length) {
            event.preventDefault()
            state.selectionManager.setFocused(true)
            state.selectionManager.setFocusedKey(
              (Number(state.selectionManager.focusedKey) ===
              stateRef.current.options.length - 1
                ? 0
                : Number(state.selectionManager.focusedKey) + 1
              ).toString()
            )
          }
          return
        }
        case 'ArrowUp': {
          if (stateRef.current.options.length) {
            event.preventDefault()
            state.selectionManager.setFocused(true)
            state.selectionManager.setFocusedKey(
              (state.selectionManager.focusedKey === '0'
                ? stateRef.current.options.length - 1
                : Number(state.selectionManager.focusedKey) - 1
              ).toString()
            )
          }
          return
        }
        case 'Enter': {
          const option =
            stateRef.current.options[Number(state.selectionManager.focusedKey)]
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
  })

  useEffect(() => {
    const domNode = ReactEditor.toDOMNode(editor, editor)
    let listener = (event: KeyboardEvent) => listenerRef.current(event)
    domNode.addEventListener('keydown', listener)
    return () => {
      domNode.removeEventListener('keydown', listener)
    }
  }, [editor])
  const triggerRef = useRef<HTMLSpanElement>(null)
  const overlayState = useOverlayTriggerState({ isOpen: true })
  const {
    triggerProps: { onPress, ...triggerProps },
    overlayProps,
  } = useOverlayTrigger({ type: 'listbox' }, overlayState, triggerRef)
  let state = useListState({
    items: options,
    children: item => <Item key={item.index}>{item.label}</Item>,
  })

  useEffect(() => {
    if (!state.selectionManager.isFocused && state.collection.size) {
      state.selectionManager.setFocused(true)
      state.selectionManager.setFocusedKey('0')
    }
  }, [state])
  const scrollableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollableRef.current?.querySelector(
      '[role="listbox"] [role="presentation"]'
    )?.children[state.selectionManager.focusedKey as number]
    if (element) {
      scrollIntoView(element, {
        scrollMode: 'if-needed',
        boundary: scrollableRef.current,
        block: 'nearest',
      })
    }
  }, [state.selectionManager.focusedKey])
  const listboxRef = useRef(null)
  let layout = useListBoxLayout()
  return (
    <Fragment>
      <span
        {...triggerProps}
        role="button"
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
        {...overlayProps}
        state={overlayState}
        triggerRef={triggerRef}
      >
        <div
          className={css({ overflow: 'scroll', maxHeight: 300 })}
          ref={scrollableRef}
        >
          <ListBoxBase
            aria-label="Insert block"
            state={state}
            shouldUseVirtualFocus
            layout={layout}
            ref={listboxRef}
            onAction={key => {
              insertOption(editor, text, options[key as number])
            }}
          />
        </div>
      </Popover>
    </Fragment>
  )
}
