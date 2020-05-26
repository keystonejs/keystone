import { Text } from '@keystonejs/fields';
import { importView } from '@keystonejs/build-field-types';

export const DocumentField = {
  type: 'Document',
  implementation: Text.implementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
