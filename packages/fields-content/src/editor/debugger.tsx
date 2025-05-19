import type { EditorState } from 'prosemirror-state'
import toJsxString from 'react-element-to-jsx-string'
import { editorStateToReactNode } from './tests/editor-state-to-react-element'

export function Debugger(props: { state: EditorState }) {
  return (
    <pre>
      <code>{toJsxString(editorStateToReactNode(props.state))}</code>
    </pre>
  )
}
