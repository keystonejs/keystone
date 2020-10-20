import cuid from 'cuid';
import { createItem, deleteItem, updateItem } from '@keystonejs/server-side-graphql-client';
import { multiAdapterRunners, setupServer } from '@keystonejs/test-utils';
import { Text, Slug } from '@keystonejs/fields';

const reverse = str => str.split('').reverse().join('');

const generateListName = () =>
  // Ensure we prefix with something easy to delete, but also must always start
  // with an upper case alpha character
  'Slugtest' +
  // Add randomness
  cuid.slug() +
  // Ensure plurality isn't a problem
  'foo';

const setupList = (adapterName, fields) => () =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList(generateListName(), { fields });
    },
  });

describe('Slug#implementation', () => {
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      test('Instantiates correctly if from is a string', () => {
        expect(() => {
          runner(
            setupList(adapterName, { url: { type: Slug, from: 'foo' } }),
            // Empty test, we just want to assert the setup works
            () => {}
          )();
        }).not.toThrow();
      });

      test(
        "By default, generates a slug from the 'name' field",
        runner(
          setupList(adapterName, {
            name: { type: Text },
            title: { type: Text },
            url: { type: Slug },
          }),
          async ({ keystone }) => {
            const { key: listKey } = keystone.listsArray[0];
            const item = { name: 'Test Entry!', title: 'A title' };
            const returnFields = 'url';
            const result = await createItem({ keystone, listKey, item, returnFields });
            expect(result).toMatchObject({ url: 'test-entry' });
          }
        )
      );

      test(
        "By default, generates a slug from the 'title' field if no 'name' field exists",
        runner(
          setupList(adapterName, {
            title: { type: Text },
            url: { type: Slug },
          }),
          async ({ keystone }) => {
            const { key: listKey } = keystone.listsArray[0];
            const item = { title: 'Something funny?' };
            const returnFields = 'url';
            const result = await createItem({ keystone, listKey, item, returnFields });
            expect(result).toMatchObject({ url: 'something-funny' });
          }
        )
      );

      test(
        "Generates a slug using the 'from' field specified",
        runner(
          setupList(adapterName, {
            username: { type: Text },
            url: { type: Slug, from: 'username' },
          }),
          async ({ keystone }) => {
            const { key: listKey } = keystone.listsArray[0];
            const item = { username: 'Test Entry!' };
            const returnFields = 'url';
            const result = await createItem({ keystone, listKey, item, returnFields });
            expect(result).toMatchObject({ url: 'test-entry' });
          }
        )
      );

      test(`Should handle an async 'generate' function`, () => {
        const generate = () => new Promise(resolve => setTimeout(() => resolve('foobar'), 4));
        return runner(
          setupList(adapterName, {
            name: { type: Text },
            url: { type: Slug, generate },
          }),
          async ({ keystone }) => {
            const { key: listKey } = keystone.listsArray[0];
            const item = { name: 'Awesome Sauce' };
            const returnFields = 'url';
            const result = await createItem({ keystone, listKey, item, returnFields });
            expect(result).toMatchObject({ url: 'foobar' });
          }
        )();
      });

      test(
        `Should handle an async 'makeUnique' function`,
        runner(
          setupList(adapterName, {
            name: { type: Text },
            url: {
              type: Slug,
              from: 'name',
              makeUnique: () => new Promise(resolve => setTimeout(() => resolve('foobar'), 4)),
            },
          }),
          async ({ keystone }) => {
            const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
            const { key: listKey } = keystone.listsArray[0];
            await createItem({ keystone, listKey, item });
            const result = await createItem({ keystone, listKey, item, returnFields: 'url' });
            expect(result).toMatchObject({ url: 'foobar' });
          }
        )
      );

      describe('create mutation', () => {
        test(
          "Doesn't generate when a value is set in mutation",
          runner(
            setupList(adapterName, {
              username: { type: Text },
              url: { type: Slug, from: 'username' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { username: 'Test Entry!', url: 'foo' };
              const returnFields = 'url';
              const result = await createItem({ keystone, listKey, item, returnFields });
              expect(result).toMatchObject({ url: 'foo' });
            }
          )
        );

        test('Calls generate with `{ resolvedData, existingData }`', () => {
          const generate = jest.fn(() => 'foobar');
          return runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, generate },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce' };
              await createItem({ keystone, listKey, item });
              expect(generate).toHaveBeenCalledTimes(1);
              expect(generate).toHaveBeenCalledWith(
                expect.objectContaining({
                  resolvedData: expect.any(Object),
                  existingItem: undefined,
                })
              );
            }
          )();
        });

        test(
          'Generates a unique slug when a collision occurs',
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const returnFields = 'url';
              await createItem({ keystone, listKey, item });
              const { url } = await createItem({ keystone, listKey, item, returnFields });
              expect(url).toMatch(/^awesome-sauce-[a-zA-Z0-9]+$/);
            }
          )
        );

        test(
          "Calls 'makeUnique' when a collision occurs",
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name', makeUnique: ({ slug }) => reverse(slug) },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const returnFields = 'url';
              await createItem({ keystone, listKey, item });
              const result = await createItem({ keystone, listKey, item, returnFields });
              expect(result).toMatchObject({ url: reverse('awesome-sauce') });
            }
          )
        );

        test("Doesn't call 'makeUnique' when isUnique: false & a collision occurs", () => {
          const makeUnique = jest.fn();
          return runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name', makeUnique, isUnique: false },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const returnFields = 'url';
              await createItem({ keystone, listKey, item, returnFields });
              const result = await createItem({ keystone, listKey, item, returnFields });
              expect(result).toMatchObject({ url: 'awesome-sauce' });
              expect(makeUnique).not.toHaveBeenCalled();
            }
          )();
        });

        test(
          'Generates a unique slug when alwaysMakeUnique: true',
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name', alwaysMakeUnique: true },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Wicked Sauce', url: 'wicked-sauce' };
              const returnFields = 'url';
              const { url } = await createItem({ keystone, listKey, item, returnFields });
              expect(url).toMatch(/^wicked-sauce-[a-zA-Z0-9]+$/);
            }
          )
        );

        test(
          "Calls 'makeUnique' when alwaysMakeUnique is true",
          runner(
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
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const returnFields = 'url';
              const result = await createItem({ keystone, listKey, item, returnFields });
              expect(result).toMatchObject({ url: reverse('awesome-sauce') });
            }
          )
        );

        test("Still calls 'makeUnique' when isUnique: false & alwaysMakeUnique: true", () => {
          const makeUnique = jest.fn(({ slug }) => reverse(slug));
          return runner(
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
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const returnFields = 'url';
              const result = await createItem({ keystone, listKey, item, returnFields });
              expect(result).toMatchObject({ url: reverse('awesome-sauce') });
              expect(makeUnique).toHaveBeenCalled();
            }
          )();
        });
      });

      describe('update mutation', () => {
        it('Calls generate with `{ resolvedData, existingData }` on update', () => {
          const generate = jest.fn(() => 'foobar');
          return runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, generate },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const { id } = await createItem({ keystone, listKey, item });

              await updateItem({
                keystone,
                listKey,
                item: { id, data: { name: 'Something Else' } },
              });

              expect(generate).toHaveBeenCalledWith(
                expect.objectContaining({
                  resolvedData: expect.any(Object),
                  existingItem: expect.any(Object),
                })
              );
            }
          )();
        });

        test(
          'Has a stable unique ID across regenerations',
          // 1. Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Update { id, author: "Sam" } (slug: 'hi-ho-dsbwerlk')
          runner(
            setupList(adapterName, {
              name: { type: Text },
              author: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Hi Ho', url: 'hi-ho' };
              const returnFields = 'id url';
              await createItem({ keystone, listKey, item });

              const { id, url } = await createItem({
                keystone,
                listKey,
                item: { name: 'Hi Ho' },
                returnFields,
              });

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { author: 'Sam' } },
                returnFields,
              });

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(result).toMatchObject({ url });
            }
          )
        );

        // NOTE: This documents current behaviour, but it would be great if in
        // the future this test were to be modified so the slug _is_ stable.
        test(
          'Does not have a stable unique ID across regenerations when a slug is supplied',
          // 1. Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id } = Create { name: "Hi Ho", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Update { id, author: "Sam", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          runner(
            setupList(adapterName, {
              name: { type: Text },
              author: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Hi Ho', url: 'hi-ho' };
              const returnFields = 'id url';
              await createItem({ keystone, listKey, item });

              const { id, url } = await createItem({ keystone, listKey, item, returnFields });

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { author: 'Sam', url: 'hi-ho' } },
                returnFields,
              });

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(result).not.toMatchObject({ url });
            }
          )
        );

        test(
          'Has a stable unique ID across regenerations when original conflict is gone',
          // 1. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id: newId } = Create { name: "Hi Ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Delete { id }
          // 4. Update { id: newId, author: "Sam" } (slug: 'hi-ho-dsbwerlk')
          runner(
            setupList(adapterName, {
              name: { type: Text },
              author: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Hi Ho', url: 'hi-ho' };
              const returnFields = 'id url';
              const originalItem = await createItem({ keystone, listKey, item });
              const { id, url } = await createItem({ keystone, listKey, item, returnFields });

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              // delete the original created item
              await deleteItem({ keystone, listKey, itemId: originalItem.id });

              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { author: 'Sam' } },
                returnFields,
              });

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(result).toMatchObject({ url });
            }
          )
        );

        test(
          'Does not have a stable unique ID across regenerations when original conflict is gone, when a slug is supplied',
          // 1. { id } = Create { name: "Hi Ho" } (slug: 'hi-ho')
          // 2. { id: newId } = Create { name: "Hi Ho", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          // 3. Delete { id }
          // 4. Update { id: newId, author: "Sam", slug: "hi-ho" } (slug: 'hi-ho-dsbwerlk')
          runner(
            setupList(adapterName, {
              name: { type: Text },
              author: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Hi Ho', url: 'hi-ho' };
              const returnFields = 'id url';
              const originalItem = await createItem({ keystone, listKey, item });
              const { id, url } = await createItem({ keystone, listKey, item, returnFields });

              // The slug has been uniquified
              expect(url).toMatch(/hi-ho-[a-zA-Z0-9]+/);

              // delete the original created item
              await deleteItem({ keystone, listKey, itemId: originalItem.id });

              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { author: 'Sam', url: 'hi-ho' } },
                returnFields,
              });

              // The url should not have changed across updates, even though we
              // have regenerateOnUpdate: true
              expect(result).not.toMatchObject({ url });
            }
          )
        );

        test('Uses supplied slug even when regenerateOnUpdate: false', () => {
          const generate = jest.fn();
          return runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, generate, regenerateOnUpdate: false },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const { id } = await createItem({ keystone, listKey, item });
              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { name: 'Something Else', url: 'something-something' } },
                returnFields: 'url',
              });
              expect(result).toMatchObject({ url: 'something-something' });
              expect(generate).not.toHaveBeenCalled();
            }
          )();
        });

        test('Has a stable slug when regenerateOnUpdate: false', () => {
          const generate = jest.fn();
          return runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, generate, regenerateOnUpdate: false },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const { id } = await createItem({ keystone, listKey, item });
              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { name: 'Something Else' } },
                returnFields: 'url',
              });
              expect(result).toMatchObject({ url: 'awesome-sauce' });
              expect(generate).not.toHaveBeenCalled();
            }
          )();
        });

        test(
          'Regenerates & Uniquifies by default',
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item1 = { name: 'Awesome Sauce', url: 'awesome-sauce' };
              const item2 = { name: 'This Post', url: 'this-post' };
              await createItem({ keystone, listKey, item: item1 });
              const { id } = await createItem({ keystone, listKey, item: item2 });
              const result = await updateItem({
                keystone,
                listKey,
                item: { id, data: { name: item1.name } },
                returnFields: 'url',
              });
              expect(result).toMatchObject({
                url: expect.stringMatching(/awesome-sauce-[a-zA-Z0-9]+/),
              });
            }
          )
        );
      });

      describe('error handling', () => {
        test("throws if 'regenerateOnUpdate' is not a bool", () => {
          return expect(
            runner(
              setupList(adapterName, {
                url: { type: Slug, from: 'foo', regenerateOnUpdate: 13 },
              })
            )()
          ).rejects.toThrow(/The 'regenerateOnUpdate' option on .*\.url must be true\/false/);
        });

        test("throws if 'alwaysMakeUnique' is not a bool", () => {
          return expect(
            runner(
              setupList(adapterName, {
                url: { type: Slug, from: 'foo', alwaysMakeUnique: 13 },
              })
            )()
          ).rejects.toThrow(/The 'alwaysMakeUnique' option on .*\.url must be true\/false/);
        });

        test("throws if both 'from' and 'generate' specified", () => {
          return expect(
            runner(
              setupList(adapterName, { url: { type: Slug, from: 'foo', generate: () => {} } })
            )()
          ).rejects.toThrow("Only one of 'from' or 'generate' can be supplied");
        });

        test("throws if 'from' is not a string", () => {
          return expect(
            runner(setupList(adapterName, { url: { type: Slug, from: 12 } }))()
          ).rejects.toThrow(/The 'from' option on .* must be a string/);
        });

        test("throws if 'from' is a function", () => {
          return expect(
            runner(setupList(adapterName, { url: { type: Slug, from: () => {} } }))()
          ).rejects.toThrow(/A function was specified for the 'from' option/);
        });

        test("throws when 'makeUnique' isn't a function", () => {
          return expect(
            runner(setupList(adapterName, { url: { type: Slug, makeUnique: 'foo' } }))()
          ).rejects.toThrow(
            /The 'makeUnique' option on .* must be a function, but received string/
          );
        });

        test(
          "throws when 'from' field doesn't exist",
          runner(
            setupList(adapterName, {
              url: { type: Slug, from: 'name' },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              try {
                await createItem({ keystone, listKey, item: {} });
                expect(true).toEqual(false);
              } catch (error) {
                expect(error).not.toBe(undefined);
                expect(error.message).toMatch(
                  /The field 'name' does not exist on the list '.*' as specified in the 'from' option of '.*\.url'/
                );
              }
            }
          )
        );

        test("throws when 'generate' returns a non-string", () => {
          runner(
            setupList(adapterName, {
              url: { type: Slug, generate: () => 12 },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              try {
                await createItem({ keystone, listKey, item: {} });
                expect(true).toEqual(false);
              } catch (error) {
                expect(error).not.toBe(undefined);
                expect(error.message).toMatch(
                  /.*\.url's 'generate' option resolved with a number, but expected a string./
                );
              }
            }
          );
        });

        test(
          "throws when 'makeUnique' returns a non-string",
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, makeUnique: () => 12 },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Make Unique', url: 'make-unique' };
              await createItem({ keystone, listKey, item });
              try {
                await createItem({ keystone, listKey, item });
                expect(true).toEqual(false);
              } catch (error) {
                expect(error).not.toBe(undefined);
                expect(error.message).toMatch(
                  /.*\.url's 'makeUnique' option resolved with a number, but expected a string./
                );
              }
            }
          )
        );

        test(
          "throws when 'makeUnique' can't generate a unique value",
          runner(
            setupList(adapterName, {
              name: { type: Text },
              url: { type: Slug, makeUnique: ({ slug }) => slug },
            }),
            async ({ keystone }) => {
              const { key: listKey } = keystone.listsArray[0];
              const item = { name: 'Make Unique', url: 'make-unique' };
              await createItem({ keystone, listKey, item });
              try {
                await createItem({ keystone, listKey, item });
                expect(true).toEqual(false);
              } catch (error) {
                expect(error).not.toBe(undefined);
                expect(error.message).toMatch(/failed after too many attempts/);
              }
            }
          )
        );
      });
    })
  );
});
