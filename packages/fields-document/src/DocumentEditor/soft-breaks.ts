import { Transforms, type Editor } from 'slate'

export function withSoftBreaks(editor: Editor): Editor {
  // TODO: should soft breaks only work in particular places
  editor.insertSoftBreak = () => {
    Transforms.insertText(editor, '\n')
  }
  return editor
}
