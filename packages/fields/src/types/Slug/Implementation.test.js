import { multiAdapterRunners, setupServer, graphqlRequest } from '@keystone-alpha/test-utils';

import cuid from 'cuid';
import Text from '../Text';
import Slug from './';

const reverse = str =>
  str
    .split('')
    .reverse()
    .join('');

const generateListName = () =>
  // Ensure we prefix with something easy to delete, but also must always start
  // with an upper case alpha character
  'Slugtest' +
  // Add randomness
  cuid.slug() +
  // Ensure plurality isn't a problem
  'n';

const setupList = (adapterName, fields) =>
  setupServer({
    name: 'Slug Tests',
    adapterName,
    createLists: keystone => {
      keystone.createList(generateListName(), { fields });
    },
  });

describe('Slug#implementation', () => {
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      it('Instantiates correctly if from is a string', () => {
        expect(() => {
          runner(
            () => setupList(adapterName, { url: { type: Slug, from: 'foo' } }),
            // Empty test, we just want to assert the setup works
            () => {}
          )();
        }).not.toThrow();
      });

      it("By default, generates a slug from the 'name' field", () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text },
              title: { type: Text },
              url: { type: Slug },
            }),
          ({ keystone }) => {
            const {
              gqlNames: { createMutationName },
            } = keystone.listsArray[0];
            return graphqlRequest({
              keystone,
              query: `mutation { ${createMutationName}(data: { name: "Test Entry!", title: "A title" } ) { id name url } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data[createMutationName]).toMatchObject({
                url: 'test-entry',
              });
            });
          }
        )();
      });

      it("By default, generates a slug from the 'title' field if no 'name' field exists", () => {
        return runner(
          () =>
            setupList(adapterName, {
              title: { type: Text },
              url: { type: Slug },
            }),
          ({ keystone }) => {
            const {
              gqlNames: { createMutationName },
            } = keystone.listsArray[0];
            return graphqlRequest({
              keystone,
              query: `mutation { ${createMutationName}(data: { title: "Something funny?" } ) { id title url } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data[createMutationName]).toMatchObject({
                url: 'something-funny',
              });
            });
          }
        )();
      });

      it("Generates a slug using the 'from' field specified", () => {
        return runner(
          () =>
            setupList(adapterName, {
              username: { type: Text },
              url: { type: Slug, from: 'username' },
            }),
          ({ keystone }) => {
            const {
              gqlNames: { createMutationName },
            } = keystone.listsArray[0];
            return graphqlRequest({
              keystone,
              query: `mutation { ${createMutationName}(data: { username: "Test Entry!" } ) { id username url } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data[createMutationName]).toMatchObject({
                url: 'test-entry',
              });
            });
          }
        )();
      });

      it(`Should handle an async 'generate' function`, () => {
        const generate = () => new Promise(resolve => setTimeout(() => resolve('foobar'), 4));
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, generate },
            }),
          async ({ keystone }) => {
            const {
              gqlNames: { createMutationName },
            } = keystone.listsArray[0];
            return graphqlRequest({
              keystone,
              query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce" } ) { id name url } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data[createMutationName]).toMatchObject({
                url: 'foobar',
              });
            });
          }
        )();
      });

      it(`Should handle an async 'makeUnique' function`, () => {
        const makeUnique = () => new Promise(resolve => setTimeout(() => resolve('foobar'), 4));
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name', makeUnique },
            }),
          async ({ keystone, create }) => {
            const {
              key,
              gqlNames: { createMutationName },
            } = keystone.listsArray[0];
            await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
            return graphqlRequest({
              keystone,
              query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data[createMutationName]).toMatchObject({
                url: 'foobar',
              });
            });
          }
        )();
      });

      describe('create mutation', () => {
        it("Doesn't generate when a value is set in mutation", () => {
          return runner(
            () =>
              setupList(adapterName, {
                username: { type: Text },
                url: { type: Slug, from: 'username' },
              }),
            ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { username: "Test Entry!", url: "foo" } ) { id username url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: 'foo',
                });
              });
            }
          )();
        });

        it('Calls generate with `{ resolvedData, existingData }`', () => {
          const generate = jest.fn(() => 'foobar');
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, generate },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce" } ) { id name url } }`,
              }).then(({ errors }) => {
                expect(errors).toBe(undefined);
                expect(generate).toHaveBeenCalledTimes(1);
                expect(generate).toHaveBeenCalledWith(
                  expect.objectContaining({
                    resolvedData: expect.any(Object),
                    existingItem: undefined,
                  })
                );
              });
            }
          )();
        });

        it('Generates a unique slug when a collision occurs', () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: expect.stringMatching(/^awesome-sauce-[a-zA-Z0-9]+$/),
                });
              });
            }
          )();
        });

        it("Calls 'makeUnique' when a collision occurs", () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, from: 'name', makeUnique: ({ slug }) => reverse(slug) },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: reverse('awesome-sauce'),
                });
              });
            }
          )();
        });

        it("Doesn't call 'makeUnique' when isUnique: false & a collision occurs", () => {
          const makeUnique = jest.fn();
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, from: 'name', makeUnique, isUnique: false },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: 'awesome-sauce',
                });
                expect(makeUnique).not.toHaveBeenCalled();
              });
            }
          )();
        });

        it('Generates a unique slug when alwaysMakeUnique: true', () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, from: 'name', alwaysMakeUnique: true },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Wicked Sauce", url: "wicked-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: expect.stringMatching(/^wicked-sauce-[a-zA-Z0-9]+$/),
                });
              });
            }
          )();
        });

        it("Calls 'makeUnique' when alwaysMakeUnique is true", () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: {
                  type: Slug,
                  from: 'name',
                  alwaysMakeUnique: true,
                  makeUnique: ({ slug }) => reverse(slug),
                },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: reverse('awesome-sauce'),
                });
              });
            }
          )();
        });

        it("Still calls 'makeUnique' when isUnique: false & alwaysMakeUnique: true", () => {
          const makeUnique = jest.fn(({ slug }) => reverse(slug));
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: {
                  type: Slug,
                  from: 'name',
                  alwaysMakeUnique: true,
                  makeUnique,
                  isUnique: false,
                },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Awesome Sauce", url: "awesome-sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).toMatchObject({
                  url: reverse('awesome-sauce'),
                });
                expect(makeUnique).toHaveBeenCalled();
              });
            }
          )();
        });
      });

      describe('update mutation', () => {
        it('Calls generate with `{ resolvedData, existingData }` on update', () => {
          const generate = jest.fn(() => 'foobar');
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, generate },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { updateMutationName },
              } = keystone.listsArray[0];
              const { id } = await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { name: "Something Else" } ) { id name url } }`,
              }).then(({ errors }) => {
                expect(errors).toBe(undefined);
                expect(generate).toHaveBeenCalledWith(
                  expect.objectContaining({
                    resolvedData: expect.any(Object),
                    existingItem: expect.any(Object),
                  })
                );
              });
            }
          )();
        });

        it('Has a stable unique ID across regenerations', () => {
          // 1. Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Update { id, author: "Sam" } (slug: 'hi-ho-dsbwerlk')
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                author: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName, updateMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Hi Ho', url: 'hi-ho' });

              const creationResult = await graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Hi Ho" } ) { id url } }`,
              });

              expect(creationResult.errors).toBe(undefined);

              const { id, url } = creationResult.data[createMutationName];

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              const updateResult = await graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { author: "Sam" } ) { id url } }`,
              });

              expect(updateResult.errors).toBe(undefined);

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(updateResult.data[updateMutationName]).toMatchObject({
                url,
              });
            }
          )();
        });

        // NOTE: This documents current behaviour, but it would be great if in
        // the future this test were to be modified so the slug _is_ stable.
        it('Does not have a stable unique ID across regenerations when a slug is supplied', () => {
          // 1. Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id } = Create { name: "Hi Ho", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Update { id, author: "Sam", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                author: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName, updateMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Hi Ho', url: 'hi-ho' });

              const creationResult = await graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Hi Ho", url: "hi-ho" } ) { id url } }`,
              });

              expect(creationResult.errors).toBe(undefined);

              const { id, url } = creationResult.data[createMutationName];

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              const updateResult = await graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { author: "Sam", url: "hi-ho" } ) { id url } }`,
              });

              expect(updateResult.errors).toBe(undefined);

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(updateResult.data[updateMutationName]).not.toMatchObject({
                url,
              });
            }
          )();
        });

        it('Has a stable unique ID across regenerations when original conflict is gone', () => {
          // 1. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id: newId } = Create { name: "Hi Ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Delete { id }
          // 4. Update { id: newId, author: "Sam" } (slug: 'hi-ho-dsbwerlk')
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                author: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create, delete: deleteFn }) => {
              const {
                key,
                gqlNames: { createMutationName, updateMutationName },
              } = keystone.listsArray[0];
              const originalItem = await create(key, { name: 'Hi Ho', url: 'hi-ho' });

              const creationResult = await graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Hi Ho" } ) { id url } }`,
              });

              expect(creationResult.errors).toBe(undefined);

              const { id, url } = creationResult.data[createMutationName];

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              // delete the original created item
              await deleteFn(key, originalItem.id);

              const updateResult = await graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { author: "Sam" } ) { id url } }`,
              });

              expect(updateResult.errors).toBe(undefined);

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(updateResult.data[updateMutationName]).toMatchObject({
                url,
              });
            }
          )();
        });

        it('Does not have a stable unique ID across regenerations when original conflict is gone, when a slug is supplied', () => {
          // 1. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id: newId } = Create { name: "Hi Ho", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Delete { id }
          // 4. Update { id: newId, author: "Sam", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                author: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create, delete: deleteFn }) => {
              const {
                key,
                gqlNames: { createMutationName, updateMutationName },
              } = keystone.listsArray[0];
              const originalItem = await create(key, { name: 'Hi Ho', url: 'hi-ho' });

              const creationResult = await graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Hi Ho", url: "hi-ho" } ) { id url } }`,
              });

              expect(creationResult.errors).toBe(undefined);

              const { id, url } = creationResult.data[createMutationName];

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              // delete the original created item
              await deleteFn(key, originalItem.id);

              const updateResult = await graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { author: "Sam", url: "hi-ho" } ) { id url } }`,
              });

              expect(updateResult.errors).toBe(undefined);

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(updateResult.data[updateMutationName]).not.toMatchObject({
                url,
              });
            }
          )();
        });

        it('Uses supplied slug even when regenerateOnUpdate: false', () => {
          const generate = jest.fn();
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, generate, regenerateOnUpdate: false },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { updateMutationName },
              } = keystone.listsArray[0];
              const { id } = await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { name: "Something Else", url: "something-something" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).toMatchObject({
                  url: 'something-something',
                });
                expect(generate).not.toHaveBeenCalled();
              });
            }
          )();
        });

        it('Has a stable slug when regenerateOnUpdate: false', () => {
          const generate = jest.fn();
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, generate, regenerateOnUpdate: false },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { updateMutationName },
              } = keystone.listsArray[0];
              const { id } = await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { name: "Something Else" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).toMatchObject({
                  url: 'awesome-sauce',
                });
                expect(generate).not.toHaveBeenCalled();
              });
            }
          )();
        });

        it('Does not generate a new slug when regenerateOnUpdate: false and no previous slug exists', () => {
          const generate = jest.fn();
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, generate, regenerateOnUpdate: false },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { updateMutationName },
              } = keystone.listsArray[0];
              const { id } = await create(key, { name: 'Awesome Sauce' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { name: "Something Else" } ) { id url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).toMatchObject({
                  url: null,
                });
                expect(generate).not.toHaveBeenCalled();
              });
            }
          )();
        });

        it('Regenerates & Uniquifies by default', () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { updateMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Awesome Sauce', url: 'awesome-sauce' });
              const { id } = await create(key, { name: 'This Post', url: 'this-post' });

              return graphqlRequest({
                keystone,
                query: `mutation { ${updateMutationName}(id: "${id}", data: { name: "Awesome Sauce" } ) { id name url } }`,
              }).then(({ data, errors }) => {
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).toMatchObject({
                  url: expect.stringMatching(/awesome-sauce-[a-zA-Z0-9]+/),
                });
              });
            }
          )();
        });
      });

      describe('error handling', () => {
        it("throws if 'regenerateOnUpdate' is not a bool", () => {
          return expect(
            runner(
              () =>
                setupList(adapterName, {
                  url: { type: Slug, from: 'foo', regenerateOnUpdate: 13 },
                }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow(/The 'regenerateOnUpdate' option on .*\.url must be true\/false/);
        });

        it("throws if 'alwaysMakeUnique' is not a bool", () => {
          return expect(
            runner(
              () =>
                setupList(adapterName, {
                  url: { type: Slug, from: 'foo', alwaysMakeUnique: 13 },
                }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow(/The 'alwaysMakeUnique' option on .*\.url must be true\/false/);
        });

        it("throws if both 'from' and 'generate' specified", () => {
          return expect(
            runner(
              () =>
                setupList(adapterName, { url: { type: Slug, from: 'foo', generate: () => {} } }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow("Only one of 'from' or 'generate' can be supplied");
        });

        it("throws if 'from' is not a string", () => {
          return expect(
            runner(
              () => setupList(adapterName, { url: { type: Slug, from: 12 } }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow(/The 'from' option on .* must be a string/);
        });

        it("throws if 'from' is a function", () => {
          return expect(
            runner(
              () => setupList(adapterName, { url: { type: Slug, from: () => {} } }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow(/A function was specified for the 'from' option/);
        });

        it("throws when 'makeUnique' isn't a function", () => {
          return expect(
            runner(
              () => setupList(adapterName, { url: { type: Slug, makeUnique: 'foo' } }),
              // Empty test, we just want to assert the setup works
              () => {}
            )()
          ).rejects.toThrow(
            /The 'makeUnique' option on .* must be a function, but received string/
          );
        });

        it("throws when 'from' field doesn't exist", () => {
          return runner(
            () =>
              setupList(adapterName, {
                url: { type: Slug, from: 'name' },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: {}) { id url } }`,
              }).then(({ errors }) => {
                expect(errors).not.toBe(undefined);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toMatch(
                  /The field 'name' does not exist on the list '.*' as specified in the 'from' option of '.*\.url'/
                );
              });
            }
          )();
        });

        it("throws when 'generate' returns a non-string", () => {
          return runner(
            () =>
              setupList(adapterName, {
                url: { type: Slug, generate: () => 12 },
              }),
            async ({ keystone }) => {
              const {
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: {}) { id url } }`,
              }).then(({ errors }) => {
                expect(errors).not.toBe(undefined);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toMatch(
                  /.*\.url's 'generate' option resolved with a number, but expected a string./
                );
              });
            }
          )();
        });

        it("throws when 'makeUnique' returns a non-string", () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, makeUnique: () => 12 },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Make Unique', url: 'make-unique' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Make Unique" }) { id url } }`,
              }).then(({ errors }) => {
                expect(errors).not.toBe(undefined);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toMatch(
                  /.*\.url's 'makeUnique' option resolved with a number, but expected a string./
                );
              });
            }
          )();
        });

        it("throws when 'makeUnique' can't generate a unique value", () => {
          return runner(
            () =>
              setupList(adapterName, {
                name: { type: Text },
                url: { type: Slug, makeUnique: ({ slug }) => slug },
              }),
            async ({ keystone, create }) => {
              const {
                key,
                gqlNames: { createMutationName },
              } = keystone.listsArray[0];
              await create(key, { name: 'Make Unique', url: 'make-unique' });
              return graphqlRequest({
                keystone,
                query: `mutation { ${createMutationName}(data: { name: "Make Unique" }) { id url } }`,
              }).then(({ errors }) => {
                expect(errors).not.toBe(undefined);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toMatch(/failed after too many attempts/);
              });
            }
          )();
        });
      });
    })
  );
});
