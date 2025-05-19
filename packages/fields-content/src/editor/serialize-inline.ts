// based on https://github.com/ProseMirror/prosemirror-markdown/blob/e59521463f62b296cc072962aa2d60b267ea4397/src/to_markdown.ts#L300-L410
import type { Fragment, Mark, MarkType, Node as ProseMirrorNode } from 'prosemirror-model'
import { getEditorSchema } from './schema'

export function textblockChildren<Node extends object>(
  fragment: Fragment,
  createTextNode: (text: string) => Node,
  createLeafNode: (node: ProseMirrorNode) => Node | undefined,
  createWrapperNode: (mark: Mark) => (Node & { children: Node[] }) | undefined
): Node[] {
  let content: Node[] = []
  let depth = 0
  let active: Mark[] = []
  let trailing = ''

  function getCurrentChildrenArray() {
    let current = content
    for (let i = 0; i < depth; i++) {
      const last = current[current.length - 1]
      if (!('children' in last)) {
        throw new Error('Expected children in last element')
      }
      current = last.children as any
    }

    return current
  }

  const process = (node: ProseMirrorNode | null, offset: number, index: number) => {
    let marks = node ? node.marks : []

    let leading = trailing
    trailing = ''

    if (
      node?.isText &&
      marks.some(mark => {
        return shouldExpelWhitespace(mark.type) && !mark.isInSet(active)
      })
    ) {
      let [, lead, rest] = /^(\s*)(.*)$/m.exec(node.text!)!
      if (lead) {
        leading += lead
        node = rest ? (node as any).withText(rest) : null
        if (!node) marks = active
      }
    }
    if (
      node &&
      node.isText &&
      marks.some(mark => {
        return (
          shouldExpelWhitespace(mark.type) &&
          (index == fragment.childCount - 1 || !mark.isInSet(fragment.child(index + 1).marks))
        )
      })
    ) {
      let [, rest, trail] = /^(.*?)(\s*)$/m.exec(node.text!)!
      if (trail) {
        trailing = trail
        node = rest ? (node as any).withText(rest) : null
        if (!node) marks = active
      }
    }

    outer: for (const [i, mark] of marks.entries()) {
      if (!isMarkTypeMixable(mark.type)) {
        continue
      }
      for (const [j, other] of active.entries()) {
        if (!isMarkTypeMixable(other.type)) break
        if (mark.eq(other)) {
          if (i > j) {
            marks = marks
              .slice(0, j)
              .concat(mark)
              .concat(marks.slice(j, i))
              .concat(marks.slice(i + 1, marks.length))
          } else if (j > i) {
            marks = marks
              .slice(0, i)
              .concat(marks.slice(i + 1, j))
              .concat(mark)
              .concat(marks.slice(j, marks.length))
          }
          continue outer
        }
      }
    }

    let keep = 0
    while (keep < Math.min(active.length, marks.length) && marks[keep].eq(active[keep])) {
      ++keep
    }
    while (keep < active.length) {
      const mark = active.pop()!
      if (mark.type !== getEditorSchema(mark.type.schema).marks.code) {
        depth--
      }
    }
    if (leading) {
      getCurrentChildrenArray().push(createTextNode(leading))
    }

    if (node) {
      while (active.length < marks.length) {
        let add = marks[active.length]
        active.push(add)
        const wrapper = createWrapperNode(add)
        if (wrapper) {
          getCurrentChildrenArray().push(wrapper)
          depth++
        }
      }
      const leaf = createLeafNode(node)
      if (leaf) {
        getCurrentChildrenArray().push(leaf)
      }
    }
  }
  fragment.forEach(process)
  process(null, 0, fragment.childCount)

  return content
}

function shouldExpelWhitespace(markType: MarkType): boolean {
  const schema = getEditorSchema(markType.schema)
  return (
    markType === schema.marks.bold ||
    markType === schema.marks.italic ||
    markType === schema.marks.strikethrough
  )
}

function isMarkTypeMixable(markType: MarkType) {
  const schema = getEditorSchema(markType.schema)
  return (
    markType === schema.marks.bold ||
    markType === schema.marks.italic ||
    markType === schema.marks.strikethrough ||
    markType === schema.marks.link
  )
}
