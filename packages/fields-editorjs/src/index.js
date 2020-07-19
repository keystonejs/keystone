import { Text } from '@keystonejs/fields';
import { importView } from '@keystonejs/build-field-types';
import { EditorJsImplementation } from './Implementation';

export let EditorJs = {
  type: 'EditorJs',
  implementation: EditorJsImplementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
