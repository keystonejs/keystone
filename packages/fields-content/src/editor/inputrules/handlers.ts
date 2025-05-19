// based on https://github.com/ProseMirror/prosemirror-inputrules/blob/47dff8a7316e5cf86343e37fd97588a30345bc0a/src/inputrules.ts
import type { InputRuleHandler } from './inputrules'
import { findWrapping, canJoin } from 'prosemirror-transform'
import type { NodeType, Node, Attrs } from 'prosemirror-model'

/// Build an input rule handler for automatically wrapping a textblock when a
/// given string is typed.
///
/// `nodeType` is the type of node to wrap in. If it needs attributes,
/// you can either pass them directly, or pass a function that will
/// compute them from the regular expression match.
///
/// By default, if there's a node with the same type above the newly
/// wrapped node, the rule will try to [join](#transform.Transform.join) those
/// two nodes. You can pass a join predicate, which takes a regular
/// expression match and the node before the wrapped node, and can
/// return a boolean to indicate whether a join should happen.
export function wrappingInputRuleHandler(
  nodeType: NodeType,
  getAttrs: Attrs | null | ((matches: RegExpMatchArray) => Attrs | null) = null,
  joinPredicate?: (match: RegExpMatchArray, node: Node) => boolean
): InputRuleHandler {
  return (state, match, start, end) => {
    let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    let tr = state.tr.delete(start, end)
    let $start = tr.doc.resolve(start),
      range = $start.blockRange(),
      wrapping = range && findWrapping(range, nodeType, attrs)
    if (!wrapping) return null
    tr.wrap(range!, wrapping)
    let before = tr.doc.resolve(start - 1).nodeBefore
    if (
      before &&
      before.type == nodeType &&
      canJoin(tr.doc, start - 1) &&
      (!joinPredicate || joinPredicate(match, before))
    ) {
      tr.join(start - 1)
    }
    return tr
  }
}

/// Build an input rule that changes the type of a textblock when the
/// matched text is typed into it. You'll usually want to start your
/// regexp with `^` to that it is only matched at the start of a
/// textblock. The optional `getAttrs` parameter can be used to compute
/// the new node's attributes, and works the same as in the
/// `wrappingInputRule` function.
export function textblockTypeInputRuleHandler(
  nodeType: NodeType,
  getAttrs: Attrs | null | ((match: RegExpMatchArray) => Attrs | null | false) = null
): InputRuleHandler {
  return (state, match, start, end) => {
    let $start = state.doc.resolve(start)
    let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    if (attrs === false) return null
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) {
      return null
    }
    return state.tr.delete(start, end).setBlockType(start, start, nodeType, attrs)
  }
}

export function replaceTypeInputRuleHandler(
  nodeType: NodeType,
  getAttrs: Attrs | null | ((match: RegExpMatchArray) => Attrs | null) = null
): InputRuleHandler {
  return (state, match, start, end) => {
    let $start = state.doc.resolve(start)
    let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) {
      return null
    }

    // might want to move the selection to after the divider
    return state.tr.delete(start, end).replaceSelectionWith(nodeType.createAndFill(attrs)!)
  }
}

export function stringHandler(replacement: string): InputRuleHandler {
  return (state, match, start, end) => {
    let insert = replacement
    if (match[1]) {
      let offset = match[0].lastIndexOf(match[1])
      insert += match[0].slice(offset + match[1].length)
      start += offset
      let cutOff = start - end
      if (cutOff > 0) {
        insert = match[0].slice(offset - cutOff, offset) + insert
        start = end
      }
    }
    return state.tr.insertText(insert, start, end)
  }
}
