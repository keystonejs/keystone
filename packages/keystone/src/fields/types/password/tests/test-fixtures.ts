import { password } from '..';

export const name = 'Password';
export const typeFunction = password;
export const exampleValue = () => 'password';
export const exampleValue2 = () => 'password2';
export const supportsUnique = false;
export const supportsNullInput = true;
export const supportsDbMap = true;
export const fieldName = 'password';
export const subfieldName = 'isSet';
export const skipCreateTest = true;
export const skipUpdateTest = true;

export const getTestFields = () => ({
  password: password({ validation: { length: { min: 4 } } }),
  passwordRejectCommon: password({ validation: { rejectCommon: true } }),
});

export const initItems = () => {
  return [
    { name: 'person1', password: 'pass1' },
    { name: 'person2', password: null },
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
    'setting a password below the length.min fails',
    keystoneTestWrapper(async ({ context }: { context: any }) => {
      await expect(
        context.query.Test.createOne({
          data: { password: '123' },
        })
      ).rejects.toMatchInlineSnapshot(`
              [GraphQLError: You provided invalid data for this operation.
                - Test.password: Password must be at least 4 characters long]
            `);
    })
  );
  test(
    'setting a common password fails',
    keystoneTestWrapper(async ({ context }: { context: any }) => {
      await expect(
        context.query.Test.createOne({
          data: { passwordRejectCommon: 'password' },
        })
      ).rejects.toMatchInlineSnapshot(`
              [GraphQLError: You provided invalid data for this operation.
                - Test.passwordRejectCommon: Password Reject Common is too common and is not allowed]
            `);
      const data = await context.query.Test.createOne({
        data: { passwordRejectCommon: 'sdfinwedvhweqfoiuwdfnvjiewrijnf' },
        query: `passwordRejectCommon {isSet}`,
      });
      expect(data.passwordRejectCommon.isSet).toBe(true);
    })
  );
};
