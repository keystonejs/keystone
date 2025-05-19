import weakMemoize from '@emotion/weak-memoize'
import { css, tokenSchema } from '@keystar/ui/style'
import type { Command, EditorState, Selection, Transaction } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { ReactNode } from 'react'
import { useEditorState } from '../editor-view'

const key = new PluginKey<AutocompleteDecorationState>('AutocompleteDecoration')

function hasSelectionInDecorations(selection: Selection, decorations: DecorationSet) {
  return decorations.find(selection.from, selection.to).length > 0
}

type AutocompleteMenu = (props: { query: string; from: number; to: number }) => ReactNode

type AutocompleteDecorationState =
  | {
      kind: 'active'
      trigger: string
      pattern: RegExp | undefined
      decorations: DecorationSet
      component: AutocompleteMenu
    }
  | { kind: 'inactive' }

const inactiveDecorationState: AutocompleteDecorationState = {
  kind: 'inactive',
}

type AddAutocompleteDecoration = {
  action: 'add'
  from: number
  to: number
  pattern: RegExp | undefined
  menu: AutocompleteMenu
}

const getStateWithoutAutocompleteDecoration = weakMemoize((state: EditorState) => {
  const tr = removeAutocompleteDecorationAndContent(state)
  if (!tr) {
    return { state }
  }
  return { state: state.apply(tr), tr }
})

export function wrapCommandAfterRemovingAutocompleteDecoration(command: Command): Command {
  return (stateWithInsertMenuText, dispatch, view): boolean => {
    const { state, tr } = getStateWithoutAutocompleteDecoration(stateWithInsertMenuText)
    if (!tr) return false
    if (dispatch) dispatch(tr)
    return command(state, dispatch, view)
  }
}

type RemoveAutocompleteDecoration = { action: 'remove' }

export type AutocompleteTrMeta = AddAutocompleteDecoration | RemoveAutocompleteDecoration

export function addAutocompleteDecoration(
  tr: Transaction,
  menu: AutocompleteMenu,
  from: number,
  to: number,
  pattern: RegExp | undefined
) {
  return tr.setMeta(key, {
    action: 'add',
    from,
    to,
    menu,
    pattern,
  } satisfies AutocompleteTrMeta)
}

export function AutocompleteDecoration() {
  const state = useEditorState()
  const pluginState = key.getState(state)
  if (!pluginState || pluginState.kind === 'inactive') return null
  return <AutocompleteDecorationInner state={pluginState} />
}

function AutocompleteDecorationInner(props: {
  state: AutocompleteDecorationState & { kind: 'active' }
}) {
  const state = useEditorState()
  const decoration = props.state.decorations.find()[0]
  const text = state.doc.textBetween(decoration.from, decoration.to).slice(1)
  return <props.state.component query={text} from={decoration.from} to={decoration.to} />
}

export function removeAutocompleteDecoration(tr: Transaction) {
  return tr.setMeta(key, { action: 'remove' } satisfies AutocompleteTrMeta)
}

function getAutocompleteDecoration(state: EditorState) {
  const pluginState = key.getState(state)
  if (pluginState?.kind === 'active') return pluginState.decorations.find()[0]
}

export function removeAutocompleteDecorationAndContent(state: EditorState) {
  const decoration = getAutocompleteDecoration(state)
  if (!decoration) return
  return removeAutocompleteDecoration(state.tr.delete(decoration.from, decoration.to))
}

const accentForeground = css({ color: tokenSchema.color.foreground.accent })

export function autocompleteDecoration(): Plugin<AutocompleteDecorationState> {
  return new Plugin<AutocompleteDecorationState>({
    key,
    state: {
      init: () => ({ kind: 'inactive' }),
      apply(tr, value, oldState, newState): AutocompleteDecorationState {
        const meta = tr.getMeta(key) as AutocompleteTrMeta | undefined
        if (meta?.action === 'add') {
          const deco = Decoration.inline(
            meta.from,
            meta.to,
            { nodeName: 'decoration-autocomplete', class: accentForeground },
            { inclusiveStart: false, inclusiveEnd: true }
          )

          const trigger = newState.doc.textBetween(meta.from, meta.to, '')
          const decorations = DecorationSet.create(tr.doc, [deco])
          return {
            kind: 'active',
            trigger,
            decorations,
            component: meta.menu,
            pattern: meta.pattern,
          }
        }
        if (value.kind === 'inactive') return value
        const decorations = value.decorations.map(tr.mapping, tr.doc)
        const decorationsArr = decorations.find()
        if (
          meta?.action === 'remove' ||
          !hasSelectionInDecorations(tr.selection, decorations) ||
          decorationsArr.length !== 1
        ) {
          return inactiveDecorationState
        }
        const { from, to } = decorationsArr[0]
        const replacementChar = '\u{fffd}'
        const textBetween = newState.doc.textBetween(from, to, replacementChar, replacementChar)

        if (
          value.trigger !== textBetween.slice(0, value.trigger.length) ||
          textBetween.includes(replacementChar) ||
          (value.pattern && !value.pattern.test(textBetween))
        ) {
          return inactiveDecorationState
        }
        return { ...value, decorations }
      },
    },
    props: {
      decorations: state => {
        const pluginState = key.getState(state)
        if (pluginState?.kind === 'active') return pluginState.decorations
        return DecorationSet.empty
      },
      handlePaste,
      handleDrop: handlePaste,
      handleKeyDown(view, event) {
        const state = key.getState(view.state)
        if (state?.kind === 'active' && event.key === 'Escape') {
          removeAutocompleteDecoration(view.state.tr)
          return true
        }
        return false
      },
    },
  })
}

function handlePaste(view: EditorView) {
  const state = key.getState(view.state)
  if (state?.kind === 'active') {
    view.dispatch(removeAutocompleteDecoration(view.state.tr))
  }
  return false
}
