// the docs site needs access to Editor and importing slate would use the version from the content field
// so we're exporting it from here (note that this is not at all visible in the published version)
export { Editor } from 'slate'

export {
  ReactEditor,
  withReact,
} from 'slate-react'

export {
  createDocumentEditor
} from './editor-shared'
