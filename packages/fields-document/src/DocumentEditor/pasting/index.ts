import {
  type Descendant,
  Element,
  Editor,
  Transforms,
  Range
} from 'slate'
import { isValidURL } from '../isValidURL'
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from '../utils'
import { deserializeHTML } from './html'
import { deserializeMarkdown } from './markdown'

const urlPattern = /https?:\/\//

function insertFragmentButDifferent (editor: Editor, nodes: Descendant[]) {
  const firstNode = nodes[0]
  if (Element.isElement(firstNode) && Editor.isBlock(editor, firstNode)) {
    insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, nodes)
  } else {
    Transforms.insertFragment(editor, nodes)
  }
}

export function withPasting (editor: Editor): Editor {
  const { insertData, setFragmentData } = editor

  editor.setFragmentData = data => {
    if (editor.selection) {
      data.setData('application/x-keystone-document-editor', 'true')
    }
    setFragmentData(data)
  }

  editor.insertData = data => {
    // this exists because behind the scenes, Slate sets the slate document
    // on the data transfer, this is great because it means when you copy and paste
    // something in the editor or between editors, it'll use the actual Slate data
    // rather than the serialized html so component blocks and etc. will work fine
    // we're setting application/x-keystone-document-editor
    // though so that we only accept slate data from Keystone's editor
    // because other editors will likely have a different structure
    // so we'll rely on the html deserialization instead
    // (note that yes, we do call insertData at the end of this function
    // which is where Slate's logic will run, it'll never do anything there though
    // since anything that will have slate data will also have text/html which we handle
    // before we call insertData)
    // TODO: handle the case of copying between editors with different components blocks
    // (right now, things will blow up in most cases)
    if (data.getData('application/x-keystone-document-editor') === 'true') {
      insertData(data)
      return
    }
    const blockAbove = Editor.above(editor, {
      match: node => Element.isElement(node) && Editor.isBlock(editor, node),
    })
    if (blockAbove?.[0].type === 'code') {
      const plain = data.getData('text/plain')
      editor.insertText(plain)
      return
    }
    const vsCodeEditorData = data.getData('vscode-editor-data')
    if (vsCodeEditorData) {
      try {
        const vsCodeData = JSON.parse(vsCodeEditorData)
        if (vsCodeData?.mode === 'markdown' || vsCodeData?.mode === 'mdx') {
          const plain = data.getData('text/plain')
          if (plain) {
            const fragment = deserializeMarkdown(plain)
            insertFragmentButDifferent(editor, fragment)
            return
          }
        }
      } catch (err) {
        console.log(err)
      }
    }

    const plain = data.getData('text/plain')

    if (
      // isValidURL is a bit more permissive than a user might expect
      // so for pasting, we'll constrain it to starting with https:// or http://
      urlPattern.test(plain) &&
      isValidURL(plain) &&
      editor.selection &&
      !Range.isCollapsed(editor.selection) &&
      // we only want to turn the selected text into a link if the selection is within the same block
      Editor.above(editor, {
        match: node =>
          Element.isElement(node) &&
          Editor.isBlock(editor, node) &&
          !(Element.isElement(node.children[0]) && Editor.isBlock(editor, node.children[0])),
      }) &&
      // and there is only text(potentially with marks) in the selection
      // no other links or inline relationships
      Editor.nodes(editor, {
        match: node => Element.isElement(node) && Editor.isInline(editor, node),
      }).next().done
    ) {
      Transforms.wrapNodes(editor, { type: 'link', href: plain, children: [] }, { split: true })
      return
    }

    const html = data.getData('text/html')
    if (html) {
      const fragment = deserializeHTML(html)
      insertFragmentButDifferent(editor, fragment)
      return
    }

    if (plain) {
      const fragment = deserializeMarkdown(plain)
      insertFragmentButDifferent(editor, fragment)
      return
    }

    insertData(data)
  }

  return editor
}
