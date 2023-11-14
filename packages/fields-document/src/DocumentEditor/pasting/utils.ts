import { type Text } from 'slate'
import { type Mark } from '../utils'

// a v important note
// marks in the markdown ast/html are represented quite differently to how they are in slate
// if you had the markdown **something https://keystonejs.com something**
// the bold node is the parent of the link node
// but in slate, marks are only represented on text nodes

const currentlyActiveMarks = new Set<Mark>()
const currentlyDisabledMarks = new Set<Mark>()
let currentLink: string | null = null

export function addMarkToChildren<T> (mark: Mark, cb: () => T): T {
  const wasPreviouslyActive = currentlyActiveMarks.has(mark)
  currentlyActiveMarks.add(mark)
  try {
    return cb()
  } finally {
    if (!wasPreviouslyActive) {
      currentlyActiveMarks.delete(mark)
    }
  }
}

export function setLinkForChildren<T> (href: string, cb: () => T): T {
  // we'll only use the outer link
  if (currentLink !== null) {
    return cb()
  }
  currentLink = href
  try {
    return cb()
  } finally {
    currentLink = null
  }
}

export function addMarksToChildren<T> (marks: Set<Mark>, cb: () => T): T {
  const marksToRemove = new Set<Mark>()
  for (const mark of marks) {
    if (!currentlyActiveMarks.has(mark)) {
      marksToRemove.add(mark)
    }
    currentlyActiveMarks.add(mark)
  }
  try {
    return cb()
  } finally {
    for (const mark of marksToRemove) {
      currentlyActiveMarks.delete(mark)
    }
  }
}

export function forceDisableMarkForChildren<T> (mark: Mark, cb: () => T): T {
  const wasPreviouslyDisabled = currentlyDisabledMarks.has(mark)
  currentlyDisabledMarks.add(mark)
  try {
    return cb()
  } finally {
    if (!wasPreviouslyDisabled) {
      currentlyDisabledMarks.delete(mark)
    }
  }
}

/**
 * This type is more strict than `Element & { type: 'link'; }` because `children`
 * is constrained to only contain Text nodes. This can't be assumed generally around the editor
 * (because of inline relationships or nested links(which are normalized away but the editor needs to not break if it happens))
 * but where this type is used, we're only going to allow links to contain Text and that's important
 * so that we know a block will never be inside an inline because Slate gets unhappy when that happens
 * (really the link inline should probably be a mark rather than an inline,
 * non-void inlines are probably always bad but that would imply changing the document
 * structure which would be such unnecessary breakage)
 */
type StrictLink = { type: 'link', href: string, children: Text[] }
// inline relationships are not here because we never create them from handling a paste from html or markdown
export type InlineFromExternalPaste = Text | StrictLink

export function getInlineNodes (
  text: string
): [InlineFromExternalPaste, ...InlineFromExternalPaste[]] {
  const node: Text = { text }
  for (const mark of currentlyActiveMarks) {
    if (!currentlyDisabledMarks.has(mark)) {
      node[mark] = true
    }
  }
  if (currentLink !== null) {
    return [
      { text: '' },
      { type: 'link' as const, href: currentLink, children: [node] },
      { text: '' },
    ]
  }
  return [node]
}
