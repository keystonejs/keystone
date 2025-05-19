import { Icon } from '@keystar/ui/icon'
import { Text } from '@keystar/ui/typography'
import { matchSorter } from 'match-sorter'
import type { NodeType } from 'prosemirror-model'
import type { Command, EditorState } from 'prosemirror-state'
import type { ReactElement} from 'react';
import { useMemo } from 'react'

import { weakMemoize } from '../utils'
import {
  addAutocompleteDecoration,
  removeAutocompleteDecoration,
  removeAutocompleteDecorationAndContent,
} from './decoration'
import {
  useEditorViewRef,
  useEditorSchema,
  useEditorState,
  useEditorDispatchCommand,
} from '../editor-view'
import { Item } from './EditorListbox'
import type { InputRule } from '../inputrules/inputrules'
import { useEditorKeydownListener } from '../keydown'
import { EditorAutocomplete } from './autocomplete'
import type { EditorSchema } from '../schema'

export type InsertMenuItemSpec = {
  label: string
  description?: string
  icon?: ReactElement
  command: (type: NodeType, schema: EditorSchema) => Command
  forToolbar?: true
}

export type WithInsertMenuNodeSpec = {
  insertMenu?: InsertMenuItemSpec[] | InsertMenuItemSpec
}

export type InsertMenuItem = {
  id: string
  label: string
  description?: string
  icon?: ReactElement
  forToolbar?: true
  command: Command
}

export const insertMenuInputRule: InputRule = {
  pattern: /(?:^|\s)\/$/,
  handler(state, _match, _start, end) {
    return addAutocompleteDecoration(state.tr, InsertMenu, end - 1, end, undefined)
  },
}

const getStateWithoutAutocompleteDecoration = weakMemoize((state: EditorState) => {
  const tr = removeAutocompleteDecorationAndContent(state)
  if (!tr) {
    return { state }
  }
  return { state: state.apply(tr), tr }
})

function wrapInsertMenuCommand(command: Command): Command {
  return (stateWithInsertMenuText, dispatch, view): boolean => {
    const { state, tr } = getStateWithoutAutocompleteDecoration(stateWithInsertMenuText)
    if (!tr) return false
    if (dispatch) dispatch(tr)
    return command(state, dispatch, view)
  }
}

export function itemRenderer(item: InsertMenuItem) {
  return (
    <Item key={item.id} textValue={item.label}>
      <Text>{item.label}</Text>
      {item.description && <Text slot="description">{item.description}</Text>}
      {item.icon && <Icon src={item.icon} />}
    </Item>
  )
}

function InsertMenu(props: { query: string; from: number; to: number }) {
  const viewRef = useEditorViewRef()
  const dispatchCommand = useEditorDispatchCommand()
  const schema = useEditorSchema()
  const editorState = useEditorState()

  const options = useMemo(
    () =>
      matchSorter(schema.insertMenuItems, props.query, {
        keys: ['label'],
      }).filter(option => option.command(editorState)),
    [editorState, schema.insertMenuItems, props.query]
  )

  useEditorKeydownListener(event => {
    if (event.key !== ' ') return false
    if (options.length === 1) {
      dispatchCommand(wrapInsertMenuCommand(options[0].command))
      return true
    }
    if (options.length === 0) {
      viewRef.current?.dispatch(removeAutocompleteDecoration(editorState.tr))
    }
    return false
  })
  return (
    <EditorAutocomplete
      from={props.from}
      to={props.to}
      aria-label="Insert menu"
      items={options}
      children={itemRenderer}
      onEscape={() => {
        const tr = removeAutocompleteDecorationAndContent(editorState)
        if (!tr) return
        viewRef.current?.dispatch(tr)
      }}
      onAction={key => {
        const option = options.find(option => option.id === key)
        if (!option) return
        dispatchCommand(wrapInsertMenuCommand(option.command))
      }}
    />
  )
}
