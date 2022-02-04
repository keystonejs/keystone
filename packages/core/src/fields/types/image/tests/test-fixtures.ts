import path from 'path';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fetch from 'node-fetch';
import { S3 } from '@aws-sdk/client-s3';
import { KeystoneConfig, KeystoneContext } from '../../../../types';
import { image } from '..';
import { expectSingleResolverError } from '../../../../../../../tests/api-tests/utils';

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
    images: {
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

export const name = 'Image';
export const typeFunction = image;

export const exampleValue = () => prepareFile('keystone.jpg');
export const exampleValue2 = () => prepareFile('react.jpg');
export const createReturnedValue = 'jpg';
export const updateReturnedValue = createReturnedValue;

export const supportsNullInput = true;
export const supportsUnique = false;
export const skipRequiredTest = true;
export const fieldName = 'avatar';
export const subfieldName = 'extension';

export const getTestFields = () => ({ avatar: image() });

export const afterAll = (matrixValue: 's3' | 'local') => {
  if (matrixValue === 'local') {
    // This matches the storagePath in the keystone config in the various test files.
    fs.rmdirSync('tmp_test_images', { recursive: true });
  }
};

export const initItems = () => [
  { avatar: prepareFile('graphql.jpg'), name: 'file0' },
  { avatar: prepareFile('keystone.jpg'), name: 'file1' },
  { avatar: prepareFile('react.jpg'), name: 'file2' },
  { avatar: prepareFile('thinkmill.jpg'), name: 'file3' },
  { avatar: prepareFile('thinkmill1.jpg'), name: 'file4' },
  { avatar: null, name: 'file5' },
  { avatar: null, name: 'file6' },
];

export const storedValues = () => [
  { avatar: { extension: 'jpg' }, name: 'file0' },
  { avatar: { extension: 'jpg' }, name: 'file1' },
  { avatar: { extension: 'jpg' }, name: 'file2' },
  { avatar: { extension: 'jpg' }, name: 'file3' },
  { avatar: { extension: 'jpg' }, name: 'file4' },
  { avatar: null, name: 'file5' },
  { avatar: null, name: 'file6' },
];

export const supportedFilters = () => [];

export const crudTests = (keystoneTestWrapper: any) => {
  describe('Create - upload', () => {
    test(
      'uploading an image directly to s3 and linking with a ref works',
      keystoneTestWrapper(
        async ({
          context,
          matrixValue,
        }: {
          context: KeystoneContext;
          matrixValue: 's3' | 'local';
        }) => {
          if (matrixValue === 'local') return;
          const s3 = new S3({
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
            region: process.env.S3_REGION!,
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
          });
          const contentFromFile = await fs.readFile(
            path.resolve(`${__dirname}/../test-files/keystone.jpg`)
          );

          await s3.putObject({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: 'keystone.jpg',
            Body: contentFromFile,
          });

          const ref = `s3:image:keystone.jpg`;

          const data = await context.query.Test.createOne({
            data: { avatar: { ref } },
            query: `
            avatar {
              __typename
              id
              filesize
              width
              height
              extension
              ref
              url
            }
        `,
          });
          const contentFromURL = await fetch(data.avatar.url).then(x => x.buffer());

          expect(contentFromURL).toEqual(contentFromFile);
          expect(data.avatar.height).toEqual(152);
          expect(data.avatar.width).toEqual(150);
        }
      )
    );
    test(
      'upload values should match expected',
      keystoneTestWrapper(
        async ({
          context,
          matrixValue,
        }: {
          context: KeystoneContext;
          matrixValue: 's3' | 'local';
        }) => {
          const filenames = ['keystone.jpeg', 'keystone.jpg', 'keystone'];
          for (const filename of filenames) {
            const data = await context.query.Test.createOne({
              data: { avatar: prepareFile(filename) },
              query: `
              avatar {
                __typename
                id
                filesize
                width
                height
                extension
                ref
                url
              }
          `,
            });
            expect(data).not.toBe(null);

            expect(data.avatar).toEqual({
              ref: `${matrixValue}:image:${data.avatar.id}.jpg`,
              url:
                matrixValue === 's3'
                  ? expect.stringContaining(`/${data.avatar.id}.jpg`)
                  : `/images/${data.avatar.id}.jpg`,
              id: data.avatar.id,
              __typename: matrixValue === 'local' ? `LocalImageFieldOutput` : `S3ImageFieldOutput`,
              filesize: 3250,
              width: 150,
              height: 152,
              extension: 'jpg',
            });
            // since it would be hard to assert exactly on the returned url for s3, we're gonna check the content instead.
            if (matrixValue === 's3') {
              const contentFromURL = await fetch(data.avatar.url).then(x => x.buffer());
              const contentFromFile = await fs.readFile(
                path.resolve(`${__dirname}/../test-files/${filename}`)
              );
              expect(contentFromURL).toEqual(contentFromFile);
            }
          }
        }
      )
    );
    test(
      'if not image file, throw',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
            mutation ($item: TestCreateInput!) {
                createTest(data: $item) {
                    avatar {
                        id
                    }
                }
            }
        `,
          variables: { item: { avatar: prepareFile('badfile.txt') } },
        });
        expect(data).toEqual({ createTest: null });
        const message = `File type not found`;
        expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
      })
    );
  });
  describe('Create - ref', () => {
    test(
      'From existing item succeeds',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        // Create an initial item
        const initialItem = await context.query.Test.createOne({
          data: { avatar: prepareFile('keystone.jpg') },
          query: `
            avatar {
              id
              __typename
              filesize
              width
              height
              extension
              ref
              url
            }
        `,
        });
        expect(initialItem).not.toBe(null);

        // Create a new item base on the first items ref
        const ref = initialItem.avatar.ref;
        const newItem = await context.query.Test.createOne({
          data: { avatar: { ref } },
          query: `
            avatar {
              id
              __typename
              filesize
              width
              height
              extension
              ref
              url
            }
        `,
        });
        expect(newItem).not.toBe(null);

        // Check that the details of both items match
        expect(newItem.avatar).toEqual(initialItem.avatar);
      })
    );
    test(
      'From invalid ref fails',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
            mutation ($item: TestCreateInput!) {
                createTest(data: $item) {
                    avatar {
                        id
                    }
                }
            }
        `,
          variables: { item: { avatar: { ref: 'Invalid ref!' } } },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Invalid image reference`;
        expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
      })
    );
    test(
      'From null ref fails',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
            mutation ($item: TestCreateInput!) {
                createTest(data: $item) {
                    avatar {
                        id
                    }
                }
            }
        `,
          variables: { item: { avatar: { ref: null } } },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Either ref or upload must be passed to ImageFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
      })
    );
    test(
      'Both upload and ref fails - valid ref',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        const initialItem = await context.query.Test.createOne({
          data: { avatar: prepareFile('keystone.jpg') },
          query: `avatar { ref }`,
        });
        expect(initialItem).not.toBe(null);

        const { data, errors } = await context.graphql.raw({
          query: `
          mutation ($item: TestCreateInput!) {
              createTest(data: $item) {
                  avatar {
                      id
                  }
              }
          }
      `,
          variables: {
            item: { avatar: { ref: initialItem.avatar.ref, ...prepareFile('keystone.jpg') } },
          },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Only one of ref and upload can be passed to ImageFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
      })
    );
    test(
      'Both upload and ref fails - invalid ref',
      keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
        const { data, errors } = await context.graphql.raw({
          query: `
          mutation ($item: TestCreateInput!) {
              createTest(data: $item) {
                  avatar {
                      id
                  }
              }
          }
      `,
          variables: {
            item: { avatar: { ref: 'Invalid', ...prepareFile('keystone.jpg') } },
          },
        });
        expect(data).toEqual({ createTest: null });
        const message = `Input error: Only one of ref and upload can be passed to ImageFieldInput`;
        expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
      })
    );
  });
};
