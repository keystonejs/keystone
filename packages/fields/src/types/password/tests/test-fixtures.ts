import { password } from '..';
import { GraphQLRequest } from '../../../../../testing/src';
import { text } from '../../text';

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
  name: text(),
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

const unpackErrors = (errors: readonly any[] | undefined) =>
  (errors || []).map(({ locations, extensions: { exception, ...extensions }, ...unpacked }) => ({
    extensions,
    ...unpacked,
  }));

export const expectBadUserInput = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({ extensions: { code: 'BAD_USER_INPUT' }, path, message }))
  );
};

export const crudTests = (keystoneTestWrapper: any) => {
  test(
    'setting a password below the minLength fails',
    keystoneTestWrapper(async ({ graphQLRequest }: { graphQLRequest: GraphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `mutation {
          createTest(data: { password: "123" }) {
            id
          }
        }`,
      });
      expect(body.data).toEqual({ createTest: null });
      // We throw an apollo error during the input resolver, which gets
      // converted to an internal server error when returned to the client.
      // We may want to look into ways to do this in a nicer way.
      console.log(JSON.stringify(body.errors[0]));
      console.log(body.errors[0].extensions.exception.errors);
      expectBadUserInput(body.errors, [
        {
          path: ['createTest'],
          message: '[password:minLength:Test:password] Value must be at least 4 characters long.',
        },
      ]);
    })
  );
  test(
    'setting a common password fails',
    keystoneTestWrapper(
      async ({ context, graphQLRequest }: { context: any; graphQLRequest: GraphQLRequest }) => {
        const { body } = await graphQLRequest({
          query: `mutation {
            createTest(data: { passwordRejectCommon: "password" }) {
              id
            }
          }`,
        });
        expect(body.data).toEqual({ createTest: null });
        // We throw an apollo error during the input resolver, which gets
        // converted to an internal server error when returned to the client.
        // We may want to look into ways to do this in a nicer way.
        expectBadUserInput(body.errors, [
          {
            path: ['createTest'],
            message:
              '[password:rejectCommon:Test:passwordRejectCommon] Common and frequently-used passwords are not allowed.',
          },
        ]);

        const item = await context.lists.Test.createOne({
          data: { passwordRejectCommon: 'sdfinwedvhweqfoiuwdfnvjiewrijnf' },
          query: `passwordRejectCommon {isSet}`,
        });
        expect(item.passwordRejectCommon.isSet).toBe(true);
      }
    )
  );
};
