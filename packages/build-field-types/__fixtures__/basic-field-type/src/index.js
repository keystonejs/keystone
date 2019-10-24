import { importView } from '@keystonejs/build-field-types';

export let MyCoolFieldType = {
  views: {
    Field: importView('./views/Field'),
  },
};
