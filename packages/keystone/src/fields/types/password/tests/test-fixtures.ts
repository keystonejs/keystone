import { password } from '..';

export const name = 'Password';
export const typeFunction = password;
export const exampleValue = () => 'password';
export const exampleValue2 = () => 'password2';
export const supportsUnique = false;
export const fieldName = 'password';
export const subfieldName = 'isSet';
export const skipCreateTest = true;
export const skipUpdateTest = true;

export const getTestFields = () => ({
  password: password({ minLength: 4 }),
  passwordRejectCommon: password({ rejectCommon: true }),
});

export const initItems = () => {
  return [
    { name: 'person1', password: 'pass1' },
    { name: 'person2', password: '' },
    { name: 'person3', password: 'pass3' },
    { name: 'person4', password: 'pass3' },
    { name: 'person5', password: 'pass3' },
    { name: 'person6', password: null },
    { name: 'person7' },
  ];
};

export const storedValues = () => [
  { name: 'person1', password: { isSet: true } },
  { name: 'person2', password: { isSet: false } },
  { name: 'person3', password: { isSet: true } },
  { name: 'person4', password: { isSet: true } },
  { name: 'person5', password: { isSet: true } },
  { name: 'person6', password: { isSet: false } },
  { name: 'person7', password: { isSet: false } },
];

export const supportedFilters = () => ['isSet'];

export const crudTests = (keystoneTestWrapper: any) => {
  test(
    'setting a password below the minLength fails',
    keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
      const { data, errors } = await context.graphql.raw({
        query: `mutation {
          createTest(data: { password: "123" }) {
            id
          }
        }`,
      });
      expect(data).toEqual({ createTest: null });
      expectValidationError(errors, [
        {
          path: ['createTest'],
          messages: ['Test.password: Value must be at least 4 characters long.'],
        },
      ]);
    })
  );
  test(
    'setting a common password fails',
    keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
      const { data, errors } = await context.graphql.raw({
        query: `mutation {
            createTest(data: { passwordRejectCommon: "password" }) {
              id
            }
          }`,
      });
      expect(data).toEqual({ createTest: null });
      expectValidationError(errors, [
        {
          path: ['createTest'],
          messages: [
            'Test.passwordRejectCommon: Common and frequently-used passwords are not allowed.',
          ],
        },
      ]);

      const item = await context.lists.Test.createOne({
        data: { passwordRejectCommon: 'sdfinwedvhweqfoiuwdfnvjiewrijnf' },
        query: `passwordRejectCommon {isSet}`,
      });
      expect(item.passwordRejectCommon.isSet).toBe(true);
    })
  );
};
