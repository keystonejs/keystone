import { list } from '@keystone-next/keystone';
import { checkbox, json, relationship, text } from '@keystone-next/keystone/fields';

export const lists = {
  Package: list({
    fields: {
      label: text({ isRequired: true }),
      pkgjson: json({ isRequired: true }),
      isPrivate: checkbox(),
      ownedBy: relationship({ ref: 'Person.packages', many: false }),
    },
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      packages: relationship({ ref: 'Package.ownedBy', many: true }),
    },
  }),
};
