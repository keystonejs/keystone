import { getItems } from '@keystonejs/server-side-graphql-client';
import { LocalFileAdapter } from '@keystonejs/file-adapters';
import { Upload } from 'graphql-upload';
import globby from 'globby';
import mime from 'mime';
import fs from 'fs';
import path from 'path';

import File from './';

export const name = 'File';
export { File as type };
export const supportsUnique = false;
export const fieldName = 'image';
export const subfieldName = 'originalFilename';

// Grab all the image files from the directory
const testFiles = globby.sync(`packages/**/src/**/File/test-files/**`, { absolute: true });
const directory = './files';

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

export const exampleValue = () => prepareFile(testFiles[0]);
export const exampleValue2 = () => prepareFile(testFiles[1]);
export const createReturnedValue = exampleValue().file.filename;
export const updateReturnedValue = exampleValue2().file.filename;

const fileAdapter = new LocalFileAdapter({ src: directory, path: '/files' });

export const fieldConfig = () => ({ adapter: fileAdapter });

export const getTestFields = () => {
  return {
    name: { type: String },
    image: { type: File, adapter: fileAdapter },
  };
};

export const initItems = () => {
  const items = testFiles.map((p, i) => ({ name: `file${i}`, image: prepareFile(p) }));
  items.push({ name: 'file4', image: null }, { name: 'file5' });
  return items;
};

export const beforeAll = () => {
  // Ensures 'directory' exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

// Remove all the files in the './files' directory after all the tests are completed
export const afterAll = () => {
  return new Promise(resolve => {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) {
            throw err;
          } else {
            resolve();
          }
        });
      }
    });
  });
};

// Get corresponding file name based on other `name` field we have set up.
const getFileName = n => initItems().find(({ name }) => n === name).image.file.filename;

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
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
