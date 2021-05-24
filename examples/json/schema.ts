import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, json, relationship, text } from '@keystone-next/fields';

export const lists = createSchema({
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
      packages: relationship({ ref: 'Packages.ownedBy', many: true }),
    },
  }),
});
