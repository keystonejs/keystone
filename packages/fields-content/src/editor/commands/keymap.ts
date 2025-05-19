import {
  chainCommands,
  joinUp,
  joinDown,
  toggleMark,
  setBlockType,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  newlineInCode,
  selectAll,
  deleteSelection,
  joinForward,
  selectNodeBackward,
  selectNodeForward,
  selectTextblockEnd,
  selectTextblockStart,
  joinBackward,
} from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { toggleList, splitListItem, liftListItem, sinkListItem } from '../lists'
import type { EditorSchema } from '../schema'
import type { Command } from 'prosemirror-state'
import { NodeSelection } from 'prosemirror-state'
import type { NodeType, ResolvedPos } from 'prosemirror-model'

const mac = typeof navigator != 'undefined' ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false

const codeModiferEnterCommand: Command = (state, dispatch, view) => {
  const { $head, $anchor } = state.selection
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
    return false
  }
  return chainCommands(createParagraphNear, liftEmptyBlock, splitBlock)(state, dispatch, view)
}

function findSelectableAncestor($pos: ResolvedPos, startDepth: number) {
  for (let depth = startDepth; depth > 0; depth--) {
    let pos = $pos.before(depth)
    const node = $pos.doc.nodeAt(pos)
    if (node && node.type.spec.selectable !== false) {
      return pos
    }
  }
}

const selectParentSelectableNode: Command = (state, dispatch) => {
  const { $from, to } = state.selection
  const same = $from.sharedDepth(to)
  if (same === 0) return false
  const pos = findSelectableAncestor($from, same)
  if (pos === undefined) return false
  if (dispatch) {
    dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
  }
  return true
}

export function keymapForSchema({ nodes, marks, config }: EditorSchema) {
  const bindings: Record<string, Command> = {}
  const add = (key: string, command: Command) => {
    if (bindings[key]) {
      bindings[key] = chainCommands(bindings[key], command)
    } else {
      bindings[key] = command
    }
  }
  if (nodes.list_item) {
    add('Enter', splitListItem(nodes.list_item))
    add('Tab', sinkListItem(nodes.list_item))
    add('Shift-Tab', liftListItem(nodes.list_item))
  }
  add('Enter', chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock))

  let deleteBackward = chainCommands(deleteSelection, joinBackward, selectNodeBackward)
  let deleteForward = chainCommands(deleteSelection, joinForward, selectNodeForward)

  add('Backspace', deleteBackward)
  add('Mod-Backspace', deleteBackward)
  add('Shift-Backspace', deleteBackward)
  add('Delete', deleteForward)
  add('Mod-Delete', deleteForward)
  add('Mod-a', selectAll)
  if (mac) {
    add('Ctrl-h', deleteBackward)
    add('Alt-Backspace', deleteBackward)
    add('Ctrl-d', deleteForward)
    add('Ctrl-Alt-Backspace', deleteForward)
    add('Alt-Delete', deleteForward)
    add('Alt-d', deleteForward)
    add('Ctrl-a', selectTextblockStart)
    add('Ctrl-e', selectTextblockEnd)
  }

  add('Mod-z', undo)
  add('Shift-Mod-z', redo)
  if (mac) {
    add('Mod-y', redo)
  }
  const modiferEnterKeys = ['Mod-Enter', 'Shift-Enter']
  if (mac) {
    modiferEnterKeys.push('Ctrl-Enter')
  }
  for (const key of modiferEnterKeys) {
    add(key, codeModiferEnterCommand)
    if (nodes.hard_break) {
      add(key, insertHardBreak(nodes.hard_break))
    }
  }
  for (const mark of Object.values(marks)) {
    if (mark.spec.shortcuts) {
      if (Array.isArray(mark.spec.shortcuts)) {
        for (const shortcut of mark.spec.shortcuts) {
          if (typeof shortcut !== 'string') {
            throw new Error(`Invalid shortcut for mark ${mark.name}`)
          }
          add(shortcut, toggleMark(mark))
        }
        continue
      }
      throw new Error(`Invalid shortcuts for mark ${mark.name}`)
    }
  }
  add('Alt-ArrowUp', joinUp)
  add('Alt-ArrowDown', joinDown)
  add('Escape', selectParentSelectableNode)
  if (nodes.unordered_list) {
    add('Shift-Ctrl-8', toggleList(nodes.unordered_list))
  }
  if (nodes.ordered_list) {
    add('Shift-Ctrl-9', toggleList(nodes.ordered_list))
  }
  add('Shift-Ctrl-0', setBlockType(nodes.paragraph))
  if (nodes.heading) {
    for (const level of config.heading.levels) {
      add(`Shift-Ctrl-${level}`, setBlockType(nodes.heading, { level }))
    }
  }

  return bindings
}

function insertHardBreak(hardBreakType: NodeType): Command {
  return (state, dispatch) => {
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(hardBreakType.create()).scrollIntoView())
    }
    return true
  }
}
