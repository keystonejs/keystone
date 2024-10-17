/** @jsxRuntime classic */
/** @jsx jsx */
import { makeEditor, jsx } from '../tests/utils'
import { MyDataTransfer } from './data-transfer'

export function htmlToEditor (html: string) {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  )
  const data = new MyDataTransfer()
  data.setData('text/html', html)
  editor.insertData(data)
  return editor
}
