import { Text } from '@keystonejs/fields';
import { importView } from '@keystonejs/build-field-types';

import { DocumentImplementation } from './Implementation';

export const DocumentField = {
  type: 'Document',
  implementation: DocumentImplementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
