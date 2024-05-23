import { Element, Editor, Node, Range, Transforms, Text } from 'slate'

import { type DocumentFeatures } from '../views'
import {
  EditorAfterButIgnoringingPointsWithNoContent,
  isElementActive,
} from './utils'
import { getAncestorComponentChildFieldDocumentFeatures } from './toolbar-state-shared'
import { type ComponentBlock } from './component-blocks/api'
import { isInlineContainer } from './editor-shared'

const isLinkActive = (editor: Editor) => {
  return isElementActive(editor, 'link')
}

export function wrapLink (editor: Editor, url: string) {
  if (isLinkActive(editor)) {
    Transforms.unwrapNodes(editor, { match: n => n.type === 'link' })
    return
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)

  if (isCollapsed) {
    Transforms.insertNodes(editor, {
      type: 'link',
      href: url,
      children: [{ text: url }],
    })
  } else {
    Transforms.wrapNodes(
      editor,
      {
        type: 'link',
        href: url,
        children: [{ text: '' }],
      },
      { split: true }
    )
  }
}

const markdownLinkPattern = /(^|\s)\[(.+?)\]\((\S+)\)$/

export function withLink (
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: Editor
): Editor {
  const { insertText, isInline, normalizeNode } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  if (editorDocumentFeatures.links) {
    editor.insertText = text => {
      insertText(text)
      if (text !== ')' || !editor.selection) return
      const startOfBlock = Editor.start(
        editor,
        Editor.above(editor, {
          match: node => Element.isElement(node) && Editor.isBlock(editor, node),
        })![1]
      )

      const startOfBlockToEndOfShortcutString = Editor.string(editor, {
        anchor: editor.selection.anchor,
        focus: startOfBlock,
      })
      const match = markdownLinkPattern.exec(startOfBlockToEndOfShortcutString)
      if (!match) return
      const ancestorComponentChildFieldDocumentFeatures =
        getAncestorComponentChildFieldDocumentFeatures(
          editor,
          editorDocumentFeatures,
          componentBlocks
        )
      if (ancestorComponentChildFieldDocumentFeatures?.documentFeatures.links === false) {
        return
      }
      const [, maybeWhitespace, linkText, href] = match
      // by doing this, the insertText(')') above will happen in a different undo than the link replacement
      // so that means that when someone does an undo after this
      // it will undo to the state of "[content](link)" rather than "[content](link" (note the missing closing bracket)
      editor.writeHistory('undos', { operations: [], selectionBefore: null })
      const startOfShortcut =
        match.index === 0
          ? startOfBlock
          : EditorAfterButIgnoringingPointsWithNoContent(editor, startOfBlock, {
              distance: match.index,
            })!
      const startOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(
        editor,
        startOfShortcut,
        {
          distance: maybeWhitespace === '' ? 1 : 2,
        }
      )!
      const endOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(editor, startOfLinkText, {
        distance: linkText.length,
      })!

      Transforms.delete(editor, {
        at: { anchor: endOfLinkText, focus: editor.selection.anchor },
      })
      Transforms.delete(editor, {
        at: { anchor: startOfShortcut, focus: startOfLinkText },
      })

      Transforms.wrapNodes(
        editor,
        { type: 'link', href, children: [] },
        { at: { anchor: editor.selection.anchor, focus: startOfShortcut }, split: true }
      )
      const nextNode = Editor.next(editor)
      if (nextNode) {
        Transforms.select(editor, nextNode[1])
      }
    }
  }

  editor.normalizeNode = ([node, path]) => {
    if (node.type === 'link') {
      if (Node.string(node) === '') {
        Transforms.unwrapNodes(editor, { at: path })
        return
      }
      for (const [idx, child] of node.children.entries()) {
        if (child.type === 'link') {
          // links cannot contain links
          Transforms.unwrapNodes(editor, { at: [...path, idx] })
          return
        }
      }
    }
    if (isInlineContainer(node)) {
      let lastMergableLink: { index: number, node: Node & { type: 'link' } } | null = null
      for (const [idx, child] of node.children.entries()) {
        if (child.type === 'link' && child.href === lastMergableLink?.node.href) {
          const firstLinkPath = [...path, lastMergableLink.index]
          const secondLinkPath = [...path, idx]
          const to = [...firstLinkPath, lastMergableLink.node.children.length]
          // note this is going in reverse, js doesn't have double-ended iterators so it's a for(;;)
          for (let i = child.children.length - 1; i >= 0; i--) {
            const childPath = [...secondLinkPath, i]
            Transforms.moveNodes(editor, { at: childPath, to })
          }
          Transforms.removeNodes(editor, { at: secondLinkPath })
          return
        }
        if (!Text.isText(child) || child.text !== '') {
          lastMergableLink = null
        }
        if (child.type === 'link') {
          lastMergableLink = { index: idx, node: child }
        }
      }
    }
    normalizeNode([node, path])
  }

  return editor
}
