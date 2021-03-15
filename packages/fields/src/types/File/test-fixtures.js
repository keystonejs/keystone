import { LocalFileAdapter } from '@keystone-next/file-adapters-legacy';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fs from 'fs';
import path from 'path';
import Text from '../Text';
import File from './';

export const name = 'File';
export const type = File;
export const supportsUnique = false;
export const fieldName = 'image';
export const subfieldName = 'originalFilename';
export const unSupportedAdapterList = ['prisma_sqlite'];

// Grab all the image files from the directory
const directory = './files';

const prepareFile = _filePath => {
  const filePath = path.resolve(`packages/fields/src/types/File/test-files/${_filePath}`);
  const upload = new Upload();
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  });
  return upload;
};

export const exampleValue = () => prepareFile('graphql.jpeg');
export const exampleValue2 = () => prepareFile('keystone.jpeg');
export const createReturnedValue = exampleValue().file.filename;
export const updateReturnedValue = exampleValue2().file.filename;

const fileAdapter = new LocalFileAdapter({ src: directory, path: '/files' });

export const fieldConfig = () => ({ adapter: fileAdapter });

export const getTestFields = () => ({
  name: { type: Text },
  image: { type, adapter: fileAdapter },
});

export const initItems = () => [
  { image: prepareFile('graphql.jpeg'), name: 'file0' },
  { image: prepareFile('keystone.jpeg'), name: 'file1' },
  { image: prepareFile('react.jpeg'), name: 'file2' },
  { image: prepareFile('thinkmill.jpeg'), name: 'file3' },
  { image: prepareFile('thinkmill1.jpeg'), name: 'file4' },
  { image: null, name: 'file5' },
  { image: null, name: 'file6' },
];

export const storedValues = () => [
  { image: { originalFilename: 'graphql.jpeg' }, name: 'file0' },
  { image: { originalFilename: 'keystone.jpeg' }, name: 'file1' },
  { image: { originalFilename: 'react.jpeg' }, name: 'file2' },
  { image: { originalFilename: 'thinkmill.jpeg' }, name: 'file3' },
  { image: { originalFilename: 'thinkmill1.jpeg' }, name: 'file4' },
  { image: null, name: 'file5' },
  { image: null, name: 'file6' },
];

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

export const supportedFilters = adapterName => [
  'null_equality',
  !['prisma_postgresql'].includes(adapterName) && 'in_empty_null',
];
