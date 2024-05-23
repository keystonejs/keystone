import { createHyperscript } from 'slate-hyperscript'
import { editorSchema } from '../../editor-shared'

const blockTypes: Record<string, { type: string }> = {}
Object.keys(editorSchema).forEach(key => {
  if (key !== 'editor') {
    blockTypes[key] = { type: key }
  }
})

export const __jsx = createHyperscript({
  elements: {
    ...blockTypes,
    relationship: { type: 'relationship' },
    link: { type: 'link' },
  },
  creators: {},
})
