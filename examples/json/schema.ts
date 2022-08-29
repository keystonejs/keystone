import { list } from '@keystone-6/core';
import { checkbox, json, relationship, text } from '@keystone-6/core/fields';

export const models = {
  Package: list({
    fields: {
      label: text({ validation: { isRequired: true } }),
      pkgjson: json(),
      isPrivate: checkbox(),
      ownedBy: relationship({ ref: 'Person.packages', many: false }),
    },
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      packages: relationship({ ref: 'Package.ownedBy', many: true }),
    },
  }),
};
