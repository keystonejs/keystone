import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Company: list({
        fields: {
          name: text(),
          location: relationship({ ref: 'Location.company' }),
        },
      }),
      Location: list({
        fields: {
          name: text(),
          // FIXME: We don't actully enforce isRequired.
          // @ts-ignore
          company: relationship({ ref: 'Company.location', isRequired: true }),
        },
      }),
    },
  }),
});

describe('update one to one relationship back reference', () => {
  test(
    'nested create',
    runner(async ({ context }) => {
      const locationName = sampleOne(alphanumGenerator);
      const _company = await context.lists.Company.createOne({
        data: { location: { create: { name: locationName } } },
        query: 'id location { id }',
      });

      const companyId = _company.id;
      const locationId = _company.location.id;

      const company = (await context.lists.Company.findOne({
        where: { id: companyId },
        query: 'id location { id }',
      })) as { id: any; location: { id: any } };
      // Everything should now be connected. 1:1 has a single connection on the first list defined.
      expect(company.location.id.toString()).toBe(locationId.toString());
    })
  );
});
