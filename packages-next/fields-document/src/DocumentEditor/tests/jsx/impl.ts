// slate-hyperscript depends on Array.prototype.flat
import 'array.prototype.flat/auto';
import { createHyperscript } from 'slate-hyperscript';

import { editorSchema } from '../../index';

const blockTypes: Record<string, { type: string }> = {};
Object.keys(editorSchema).forEach(key => {
  if (key !== 'editor') {
    blockTypes[key] = { type: key };
  }
});

export const __jsx = createHyperscript({
  elements: {
    ...blockTypes,
    relationship: { type: 'relationship' },
    link: { type: 'link' },
  },
  creators: {},
});
