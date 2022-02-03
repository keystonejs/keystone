import path from 'path';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fetch from 'node-fetch';
import { file } from '..';
import { expectSingleResolverError } from '../../../../../../../tests/api-tests/utils';
import { KeystoneConfig } from '../../../../types/config';

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
    return {};
  }
  return {
    files: {
      upload: 's3',
    },
    experimental: {
      s3: {
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

export const getTestFields = () => ({ secretFile: file() });

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
          expect(data).not.toBe(null);
          expect(data.secretFile.ref).toEqual(`${matrixValue}:file:${data.secretFile.filename}`);
          // since it would be hard to assert exactly on the returned url for s3, we're gonna check the content instead.
          if (matrixValue === 's3') {
            expect(data.secretFile.url).toEqual(
              expect.stringContaining(`/${data.secretFile.filename}`)
            );
            const contentFromURL = await fetch(data.secretFile.url).then(x => x.buffer());
            const contentFromFile = await fs.readFile(
              path.resolve(`${__dirname}/../test-files/${filename}`)
            );
            expect(contentFromURL).toEqual(contentFromFile);
          } else {
            expect(data.secretFile.url).toEqual(`/files/${data.secretFile.filename}`);
          }
          expect(data.secretFile.filesize).toEqual(3250);
          expect(data.secretFile.__typename).toEqual(
            matrixValue === 'local' ? 'LocalFileFieldOutput' : 'S3FileFieldOutput'
          );
        }
      )
    );
  });
  describe('Create - ref', () => {
    test(
      'From existing item succeeds',
      keystoneTestWrapper(async ({ context }: { context: any }) => {
        // Create an initial item
        const initialItem = await context.query.Test.createOne({
          data: { secretFile: prepareFile('keystone.jpg') },
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
        expect(initialItem).not.toBe(null);

        // Create a new item base on the first items ref
        const ref = initialItem.secretFile.ref;
        const newItem = await context.query.Test.createOne({
          data: { secretFile: { ref } },
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
        expect(newItem).not.toBe(null);

        // Check that the details of both items match
        expect(newItem.secretFile).toEqual(initialItem.secretFile);
      })
    );
    test(
      'From invalid ref fails',
      keystoneTestWrapper(async ({ context }: { context: any }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
            mutation ($item: TestCreateInput!) {
                createTest(data: $item) {
                    secretFile {
                        filename
                    }
                }
            }
        `,
          variables: { item: { secretFile: { ref: 'Invalid ref!' } } },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Invalid file reference`;
        expectSingleResolverError(errors, 'createTest', 'Test.secretFile', message);
      })
    );
    test(
      'From null ref fails',
      keystoneTestWrapper(async ({ context }: { context: any }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
            mutation ($item: TestCreateInput!) {
                createTest(data: $item) {
                    secretFile {
                        filename
                    }
                }
            }
        `,
          variables: { item: { secretFile: { ref: null } } },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Either ref or upload must be passed to FileFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.secretFile', message);
      })
    );
    test(
      'Both upload and ref fails - valid ref',
      keystoneTestWrapper(async ({ context }: { context: any }) => {
        const initialItem = await context.query.Test.createOne({
          data: { secretFile: prepareFile('keystone.jpg') },
          query: `secretFile { ref }`,
        });
        expect(initialItem).not.toBe(null);

        const { data, errors } = await context.graphql.raw({
          query: `
          mutation ($item: TestCreateInput!) {
              createTest(data: $item) {
                  secretFile {
                     filename
                  }
              }
          }
      `,
          variables: {
            item: {
              secretFile: { ref: initialItem.secretFile.ref, ...prepareFile('keystone.jpg') },
            },
          },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Only one of ref and upload can be passed to FileFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.secretFile', message);
      })
    );
    test(
      'Both upload and ref fails - invalid ref',
      keystoneTestWrapper(async ({ context }: { context: any }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
          mutation ($item: TestCreateInput!) {
              createTest(data: $item) {
                  secretFile {
                      filename
                  }
              }
          }
      `,
          variables: {
            item: { secretFile: { ref: 'Invalid', ...prepareFile('keystone.jpg') } },
          },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Only one of ref and upload can be passed to FileFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.secretFile', message);
      })
    );
  });
};
