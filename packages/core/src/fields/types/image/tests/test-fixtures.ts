import path from 'path';
import { createHash } from 'crypto';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fetch from 'node-fetch';
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

type MatrixValue = 's3' | 'local';

export const fieldConfig = () => ({ storage: 'test_image' });

const TEMP_STORAGE = 'tmp_test_images';

export const getRootConfig = (matrixValue: MatrixValue): Partial<KeystoneConfig> => {
  if (matrixValue === 'local') {
    return {
      storage: {
        test_image: {
          type: 'image',
          kind: 'local',
          storagePath: TEMP_STORAGE,
          removeFileOnDelete: true,
        },
      },
    };
  }
  return {
    storage: {
      test_image: {
        type: 'image',
        kind: 's3',
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

export const getTestFields = () => ({ avatar: image({ storage: 'test_image' }) });

export const afterAll = (matrixValue: MatrixValue) => {
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

const checkFileExists = async (filename: string, matrixValue: MatrixValue) => {
  let contentFromURL = null;

  try {
    if (matrixValue === 's3') {
      contentFromURL = await fetch(filename).then(x => x.buffer());
    } else {
      contentFromURL = await fs.readFile(path.join(TEMP_STORAGE, `${filename}`));
    }
  } catch (e) {}

  return contentFromURL && createHash('sha1').update(contentFromURL).digest('hex');
};

const createItem = async (context: any, filename: string) =>
  await context.query.Test.createOne({
    data: { avatar: prepareFile(filename) },
    query: `
  id
  avatar {
    __typename
    id
    filesize
    width
    height
    extension
    url
  }
`,
  });

export const crudTests = (keystoneTestWrapper: any) => {
  describe('Create - upload', () => {
    test(
      'upload values should match expected',
      keystoneTestWrapper(
        async ({
          context,
          matrixValue,
        }: {
          context: KeystoneContext;
          matrixValue: MatrixValue;
        }) => {
          const filenames = ['keystone.jpeg', 'keystone.jpg', 'keystone'];
          for (const filename of filenames) {
            const fileHash = createHash('sha1')
              .update(fs.readFileSync(path.resolve(`${__dirname}/../test-files/${filename}`)))
              .digest('hex');

            const data = await createItem(context, filename);
            expect(data).not.toBe(null);

            expect(data.avatar).toEqual({
              url:
                matrixValue === 's3'
                  ? expect.stringContaining(`/${data.avatar.id}.jpg`)
                  : `/images/${data.avatar.id}.jpg`,
              id: data.avatar.id,
              __typename: 'ImageFieldOutput',
              filesize: 3250,
              width: 150,
              height: 152,
              extension: 'jpg',
            });

            expect(fileHash).toEqual(
              await checkFileExists(data.avatar.url.replace('/images', ''), matrixValue)
            );
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

  describe('After Operation Hook', () => {
    test(
      'without delete',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: MatrixValue }) => {
          const ogFilename = 'keystone.jpeg';

          const { id, avatar } = await createItem(context, ogFilename);

          await context.query.Test.updateOne({
            where: { id },
            data: { avatar: prepareFile('thinkmill.jpg') },
          });

          expect(
            await checkFileExists(`${avatar.id}.${avatar.extension}`, matrixValue)
          ).toBeTruthy();

          await context.query.Test.deleteOne({ where: { id } });

          expect(
            await checkFileExists(`${avatar.id}.${avatar.extension}`, matrixValue)
          ).toBeTruthy();
          // TODO test that just nulling the field doesn't delete it
        }
      )
    );

    test(
      'with delete',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: MatrixValue }) => {
          const ogFilename = 'keystone.jpeg';
          const { id, avatar } = await createItem(context, ogFilename);
          const filename = `${avatar.id}.${avatar.extension}`;

          expect(await checkFileExists(filename, matrixValue)).toBeTruthy();
          const { avatar: avatar2 } = await context.query.Test.updateOne({
            where: { id },
            data: { avatar: prepareFile('thinkmill.jpg') },
            query: `avatar {
              id
              extension
            }`,
          });

          const filename2 = `${avatar2.id}.${avatar2.extension}`;

          expect(await checkFileExists(filename, matrixValue)).toBeFalsy();
          expect(await checkFileExists(filename2, matrixValue)).toBeTruthy();

          await context.query.Test.deleteOne({ where: { id } });

          expect(await checkFileExists(filename2, matrixValue)).toBeFalsy();

          // TODO test that just nulling the field removes the file
        }
      )
    );
  });
};
