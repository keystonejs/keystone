// https://github.com/ProseMirror/prosemirror-inputrules/blob/47dff8a7316e5cf86343e37fd97588a30345bc0a/src/inputrules.ts
// modified to add as a separate transaction with closeHistory so that undo and redo just works correctly
import { closeHistory } from 'prosemirror-history'
import type { Transaction, EditorState } from 'prosemirror-state'
import { Plugin, TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export type InputRuleHandler = (
  state: EditorState,
  match: RegExpMatchArray,
  start: number,
  end: number
) => Transaction | null

export type InputRule = {
  pattern: RegExp
  handler: InputRuleHandler
}

const MAX_MATCH = 500

/// Create an input rules plugin. When enabled, it will cause text
/// input that matches any of the given rules to trigger the rule's
/// action.
export function inputRules({
  rules,
  enterRules,
}: {
  rules: readonly InputRule[]
  enterRules: readonly InputRule[]
}) {
  return new Plugin({
    props: {
      handleTextInput(view) {
        setTimeout(() => {
          run(view, rules)
        })
        return false
      },
      handleKeyDown(view, event) {
        if (event.key === 'Enter') {
          return run(view, enterRules)
        }
        return false
      },
      handleDOMEvents: {
        compositionend: view => {
          setTimeout(() => {
            run(view, rules)
          })
        },
      },
    },
  })
}

function getMatch(state: EditorState, from: number, to: number, rules: readonly InputRule[]) {
  const $from = state.doc.resolve(from)
  if ($from.parent.type.spec.code) return
  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    null,
    '\ufffc'
  )
  for (const rule of rules) {
    const match = rule.pattern.exec(textBefore)
    if (!match) continue
    const matchFrom = from - match[0].length
    const tr = rule.handler(state, match, matchFrom, to)
    if (!tr) continue
    return tr
  }
  return
}

function run(view: EditorView, rules: readonly InputRule[]) {
  const state = view.state
  if (view.composing || !(state.selection instanceof TextSelection)) {
    return false
  }
  const { $cursor } = state.selection
  if (!$cursor) return false
  const tr = getMatch(state, $cursor.pos, $cursor.pos, rules)
  if (!tr) return false
  view.dispatch(closeHistory(tr))
  return true
}
