import { password } from '..';
import { expectMutationError } from '../../../../../../tests/api-tests/utils';
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
      expectMutationError(body.errors, [
        {
          path: ['createTest'],
          errors: [
            {
              message: 'You attempted to perform an invalid mutation',
              data: {
                errors: [
                  {
                    data: {},
                    msg: '[password:minLength:Test:password] Value must be at least 4 characters long.',
                  },
                ],
              },
              extensions: {
                code: 'KS_VALIDATION_FAILURE',
                data: {
                  errors: [
                    {
                      data: {},
                      msg: '[password:minLength:Test:password] Value must be at least 4 characters long.',
                    },
                  ],
                },
              },
            },
          ],
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
        expectMutationError(body.errors, [
          {
            path: ['createTest'],
            errors: [
              {
                message: 'You attempted to perform an invalid mutation',
                data: {
                  errors: [
                    {
                      data: {},
                      msg: '[password:rejectCommon:Test:passwordRejectCommon] Common and frequently-used passwords are not allowed.',
                    },
                  ],
                },
                extensions: {
                  code: 'KS_VALIDATION_FAILURE',
                  data: {
                    errors: [
                      {
                        data: {},
                        msg: '[password:rejectCommon:Test:passwordRejectCommon] Common and frequently-used passwords are not allowed.',
                      },
                    ],
                  },
                },
              },
            ],
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
