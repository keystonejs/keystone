/** @jsxRuntime classic */
/** @jsx jsx */
import { renderEditor, jsx } from '../utils'
import { MyDataTransfer } from './data-transfer'

export async function htmlToEditor(html: string) {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  )
  const dataTransfer = new MyDataTransfer()
  dataTransfer.setData('text/html', html)
  await user.paste(dataTransfer)
  return state()
}

export function plainTextDataTransfer(data: string) {
  const dt = new MyDataTransfer()
  dt.setData('text/plain', data)
  return dt
}
