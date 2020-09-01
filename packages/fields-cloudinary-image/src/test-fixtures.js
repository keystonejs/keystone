const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { getItems } from '@keystonejs/server-side-graphql-client';
import { CloudinaryAdapter } from '@keystonejs/file-adapters';
import cloudinary from 'cloudinary';
import { Upload } from 'graphql-upload';
import globby from 'globby';
import mime from 'mime';
import fs from 'fs';

import { CloudinaryImage } from './';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Grab all the image files from the directory
const testFiles = globby.sync(`packages/fields-cloudinary-image/src/test-files/**`, {
  absolute: true,
});

const prepareFile = filePath => {
  const upload = new Upload();
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  });
  return upload;
};

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'cloudinary-test',
});

// Get corresponding file name based on other `name` field we have set up.
const getFileName = n => initItems().find(({ name }) => n === name).image.file.filename;

// Configurations
export const name = 'CloudinaryImage';
export { CloudinaryImage as type };
export const supportsUnique = false;

// This function will run after all the tests are completed.
// We use it to cleanup the resources (e.g Cloudinary images) which are no longer required.
export const afterAll = () => cloudinary.v2.api.delete_resources_by_prefix('cloudinary-test');
export const exampleValue = prepareFile(testFiles[0]);
export const exampleValue2 = prepareFile(testFiles[1]);
export const createReturnedValue = exampleValue.file.filename;
export const updateReturnedValue = exampleValue2.file.filename;

export const fieldConfig = { adapter: cloudinaryAdapter };
export const getTestFields = () => {
  return {
    name: { type: String },
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  };
};
export const initItems = () => {
  let items = testFiles.map((p, i) => ({ name: `file${i}`, image: prepareFile(p) }));
  items.push({ name: 'file4', image: null }, { name: 'file5' });
  return items;
};

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
