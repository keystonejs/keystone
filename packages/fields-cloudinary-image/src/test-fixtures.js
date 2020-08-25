const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { CloudinaryAdapter } from '@keystonejs/file-adapters';

import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

import globby from 'globby';
import mime from 'mime';
import fs from 'fs';

import { CloudinaryImage } from './';

export const name = 'CloudinaryImage';
export { CloudinaryImage as type };
export const supportsUnique = false;
export const skipRequiredTest = false;

// This function will run after all the tests are completed.
// We use it to cleanup the resources (e.g Cloudinary images) which are no longer required.
export const afterAll = () => cloudinary.v2.api.delete_resources_by_prefix('cloudinary-test');

// Grab all the image files from the directory
const testFiles = globby.sync(`packages/fields-cloudinary-image/src/test-files/**`, {
  absolute: true,
});

const prepareFile = filePath => {
  const filename = path.basename(filePath);
  const mimetype = mime.getType(filePath);
  const createReadStream = () => fs.createReadStream(filePath);
  const encoding = 'utf-8';
  return { createReadStream, filename, mimetype, encoding };
};

export const exampleValue = prepareFile(testFiles[0]);
export const exampleValue2 = prepareFile(testFiles[1]);

const fileAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'cloudinary-test',
});

export const fieldConfig = { adapter: fileAdapter };

export const getTestFields = () => {
  return {
    name: { type: String },
    image: { type: CloudinaryImage, adapter: fileAdapter },
  };
};

export const initItems = () => {
  let items = testFiles.map((p, i) => ({ name: `file${i}`, image: prepareFile(p) }));
  items.push({ name: 'file4', image: null }, { name: 'file5' });
  return items;
};

// Get corresponding file name based on other `name` field we have set up.
const getFileName = n => initItems().find(({ name }) => n === name).image.filename;

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name image { originalFilename }',
        sortBy,
      })
    ).toEqual(expected);

  // Expected item
  const testExpectedItems = Array.from({ length: 4 }, (_, i) => ({
    name: `file${i}`,
    image: { originalFilename: getFileName(`file${i}`) },
  }));
  testExpectedItems.push({ name: 'file4', image: null }, { name: 'file5', image: null });

  test(
    'No filter',
    withKeystone(({ keystone }) => match(keystone, undefined, testExpectedItems))
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) => match(keystone, {}, testExpectedItems))
  );

  test(
    'Filter: image_not null',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        { image_not: null },
        testExpectedItems.filter(({ image }) => image !== null)
      )
    )
  );

  test(
    'Filter: image_not_in null',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        { image_not_in: [null] },
        testExpectedItems.filter(({ image }) => image !== null)
      )
    )
  );

  test(
    'Filter: image_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { image_in: [] }, []))
  );

  test(
    'Filter: image_not_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { image_not_in: [] }, testExpectedItems))
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id image { originalFilename }',
        sortBy: 'name_ASC',
      });

      return wrappedFn({ keystone, listKey, items });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, listKey }) => {
        const filePath = globby.sync('packages/**/src/**/File/test-files/react.jpeg', {
          absolute: true,
        });
        const image = prepareFile(filePath[0]);
        const data = await createItem({
          keystone,
          listKey,
          item: { name: 'Keystone loves React', image },
          returnFields: 'id image { originalFilename }',
        });
        expect(data).not.toBe(null);
        expect(data.image.originalFilename).toEqual('react.jpeg');
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'id image { originalFilename }',
        });

        expect(data).not.toBe(null);
        expect(data.image.originalFilename).toBe(items[0].image.originalFilename);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const filePath = globby.sync('packages/**/src/**/File/test-files/keystone.jpeg', {
            absolute: true,
          });
          const image = prepareFile(filePath[0]);
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { image },
            },
            returnFields: 'image { originalFilename }',
          });
          expect(data).not.toBe(null);
          expect(data.image.originalFilename).toBe('keystone.jpeg');
        })
      )
    );

    test(
      'Updating the value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[3].id,
              data: { image: null },
            },
            returnFields: 'image',
          });
          expect(data).not.toBe(null);
          expect(data.image).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { name: 'Keystone User Guide' },
            },
            returnFields: 'name image { originalFilename }',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('Keystone User Guide');
          expect(data.image.originalFilename).toBe(items[0].image.originalFilename);
        })
      )
    );
  });
};
