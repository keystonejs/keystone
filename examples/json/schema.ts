import { list } from '@keystone-next/keystone';
import { checkbox, json, relationship, text } from '@keystone-next/keystone/fields';

export const lists = {
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
