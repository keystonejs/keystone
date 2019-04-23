import { importView } from '@keystone-alpha/build-field-types';

export let MyCoolFieldType = {
  views: {
    Field: importView('./views/Field'),
  },
};
