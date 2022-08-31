import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { checkbox, json, relationship, text } from '@keystone-6/core/fields';

export const lists = {
  Package: list({
    access: allowAll,
    fields: {
      label: text({ validation: { isRequired: true } }),
      pkgjson: json(),
      isPrivate: checkbox(),
      ownedBy: relationship({ ref: 'Person.packages', many: false }),
    },
  }),
  Person: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      packages: relationship({ ref: 'Package.ownedBy', many: true }),
    },
  }),
};
