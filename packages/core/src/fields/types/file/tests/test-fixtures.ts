import path from 'path';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fetch from 'node-fetch';
import { file } from '..';
import { expectSingleResolverError } from '../../../../../../../tests/api-tests/utils';
import { KeystoneConfig } from '../../../../types/config';
import { createHash } from 'crypto';

const prepareFile = (_filePath: string) => {
  const filePath = path.resolve(`${__dirname}/../test-files/${_filePath}`);
  const upload = new Upload();
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    // @ts-ignore
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  });
  return { upload };
};

export const testMatrix = ['local'];

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3');
}

export const getRootConfig = (matrixValue: 's3' | 'local'): Partial<KeystoneConfig> => {
  if (matrixValue === 'local') {
    return {
      storage: {
        test_file: {
          kind: 'local',
          type: 'file',
        },
      },
    };
  }
  return {
    storage: {
      test_file: {
        kind: 's3',
        type: 'file',
        bucketName: process.env.S3_BUCKET_NAME!,
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    },
  };
};

export const name = 'File';
export const typeFunction = file;

export const exampleValue = () => prepareFile('keystone.jpg');
export const exampleValue2 = () => prepareFile('react.jpg');
export const createReturnedValue = 3250;
export const updateReturnedValue = 5562;

export const supportsNullInput = true;
export const supportsUnique = false;
export const skipRequiredTest = true;
export const fieldName = 'secretFile';
export const subfieldName = 'filesize';
export const fieldConfig = () => ({ storage: 'test_file' });

export const getTestFields = () => ({ secretFile: file({ storage: 'test_file' }) });

export const afterEach = async (matrixValue: 's3' | 'local') => {
  if (matrixValue === 'local') {
    // This matches the storagePath in the keystone config in the various test files.
    fs.rmdirSync('tmp_test_files', { recursive: true });
  }
};

export const initItems = () => [
  { secretFile: prepareFile('graphql.jpg'), name: 'file0' },
  { secretFile: prepareFile('keystone.jpg'), name: 'file1' },
  { secretFile: prepareFile('react.jpg'), name: 'file2' },
  { secretFile: prepareFile('thinkmill.jpg'), name: 'file3' },
  { secretFile: prepareFile('thinkmill1.jpg'), name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
];

export const storedValues = () => [
  { secretFile: { filesize: 2759 }, name: 'file0' },
  { secretFile: { filesize: 3250 }, name: 'file1' },
  { secretFile: { filesize: 5562 }, name: 'file2' },
  { secretFile: { filesize: 1028 }, name: 'file3' },
  { secretFile: { filesize: 1028 }, name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
];

export const supportedFilters = () => [];

const addFile = () => {};

const checkFileExists = async (fileName: string) => {
  // expect(data).not.toBe(null);
  // since it would be hard to assert exactly on the returned url for s3, we're gonna check the content instead.
  if (matrixValue === 's3') {
    // expect(data.secretFile.url).toEqual(expect.stringContaining(`/${data.secretFile.filename}`));

    const contentFromURL = await fetch(fileName).then(x => x.buffer());
    const contentFromFile = await fs.readFile(
      path.resolve(`${__dirname}/../test-files/${fileName}`)
    );
    expect(contentFromURL).toEqual(contentFromFile);
  } else {
    expect(data.secretFile.url).toEqual(`/files/${data.secretFile.filename}`);
  }
  expect(data.secretFile.filesize).toEqual(3250);
  expect(data.secretFile.__typename).toEqual(
    matrixValue === 'local' ? 'LocalFileFieldOutput' : 'S3FileFieldOutput'
  );
  return createHash('sha1').update(contentFromFile).digest('hex');
};

export const crudTests = (keystoneTestWrapper: any) => {
  describe('Create - upload', () => {
    test(
      'upload values should match expected',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: 's3' | 'local' }) => {
          const filename = 'keystone.jpeg';
          const data = await context.query.Test.createOne({
            data: { secretFile: prepareFile(filename) },
            query: `
              secretFile {
                filename
                __typename
                filesize
                ref
                url
              }
          `,
          });
        }
      )
    );
  });
  describe('Delete - remove file', () => {
    // test 1: remove field, check file is deleted at source
    // test 2: remove item, check file is deleted at source
    // test 3: add difference file, check file is deleted at source
    // test 4: check file still exists in one(?) of the above if delete isn't set
    // checkExists function
  });
  describe('Update - replace file', () => {});
};
