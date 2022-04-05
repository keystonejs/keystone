import path from 'path';
import { createHash } from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { image } from '..';
import { StorageKind } from '../../../../types/config';
import { apiTestConfig } from '../../../../../../../tests/api-tests/utils';
import { setupTestRunner } from '../../../../testing';
import { list } from '../../../..';
import { text } from '../../text';
import { expectSingleResolverError } from '../../../../../../../tests/api-tests/utils';
import { TEMP_STORAGE, MatrixValue, prepareFile } from './test-fixtures';

export const testMatrix: Array<MatrixValue> = ['local'];

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3');
}

const getFileHash = async (filename: string, matrixValue: MatrixValue) => {
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

const localDefaultStorage = {
  type: 'image',
  kind: 'local',
  storagePath: TEMP_STORAGE,
} as const;

const s3DefaultStorage: StorageKind = {
  type: 'image',
  kind: 's3',
  bucketName: process.env.S3_BUCKET_NAME!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
} as const;

const getRunner = (
  { storageConfig = localDefaultStorage }: { storageConfig: StorageKind } = {
    storageConfig: localDefaultStorage,
  }
) =>
  setupTestRunner({
    config: apiTestConfig({
      storage: {
        test_image: storageConfig,
      },
      lists: {
        Test: list({
          fields: {
            name: text(),
            avatar: image({ storage: 'test_image' }),
          },
        }),
      },
    }),
  });

describe('Crud special tests', () => {
  afterAll(() => {
    if (testMatrix.includes('local')) {
      // This matches the storagePath in the keystone config in the various test files.
      fs.rmdirSync(TEMP_STORAGE, { recursive: true });
    }
  });

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

  describe('Create - upload', () => {
    for (let matrixValue of testMatrix) {
      test(
        'upload values should match expected',
        getRunner({ storageConfig: matrixValue === 's3' ? s3DefaultStorage : localDefaultStorage })(
          async ({ context }) => {
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
                await getFileHash(data.avatar.url.replace('/images', ''), matrixValue)
              );
            }
          }
        )
      );
      test(
        'if not image file, throw',
        getRunner({ storageConfig: matrixValue === 's3' ? s3DefaultStorage : localDefaultStorage })(
          async ({ context }) => {
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
          }
        )
      );

      describe('After Operation Hook', () => {
        test(
          'without delete',
          getRunner({
            storageConfig: matrixValue === 's3' ? s3DefaultStorage : localDefaultStorage,
          })(async ({ context }) => {
            const ogFilename = 'keystone.jpeg';

            const { id, avatar } = await createItem(context, ogFilename);

            await context.query.Test.updateOne({
              where: { id },
              data: { avatar: prepareFile('thinkmill.jpg') },
            });

            expect(await getFileHash(`${avatar.id}.${avatar.extension}`, matrixValue)).toBeTruthy();

            await context.query.Test.deleteOne({ where: { id } });

            expect(await getFileHash(`${avatar.id}.${avatar.extension}`, matrixValue)).toBeTruthy();
            // TODO test that just nulling the field doesn't delete it
          })
        );

        test(
          'with delete',
          getRunner({
            storageConfig:
              matrixValue === 's3'
                ? { ...s3DefaultStorage, removeFileOnDelete: true }
                : { ...localDefaultStorage, removeFileOnDelete: true },
          })(async ({ context }) => {
            const ogFilename = 'keystone.jpeg';
            const { id, avatar } = await createItem(context, ogFilename);
            const filename = `${avatar.id}.${avatar.extension}`;

            expect(await getFileHash(filename, matrixValue)).toBeTruthy();
            const { avatar: avatar2 } = await context.query.Test.updateOne({
              where: { id },
              data: { avatar: prepareFile('thinkmill.jpg') },
              query: `avatar {
                  id
                  extension
                }`,
            });

            const filename2 = `${avatar2.id}.${avatar2.extension}`;

            expect(await getFileHash(filename, matrixValue)).toBeFalsy();
            expect(await getFileHash(filename2, matrixValue)).toBeTruthy();

            await context.query.Test.deleteOne({ where: { id } });

            expect(await getFileHash(filename2, matrixValue)).toBeFalsy();

            // TODO test that just nulling the field removes the file
          })
        );
      });
    }
  });
});
