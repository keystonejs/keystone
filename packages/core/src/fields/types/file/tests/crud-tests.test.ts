import path from 'path';
import { createHash } from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { file } from '..';
import { StorageConfig } from '../../../../types/config';
import { apiTestConfig } from '../../../../../../../tests/api-tests/utils';
import { setupTestRunner } from '../../../../testing';
import { list } from '../../../..';
import { text } from '../../text';
import { TEMP_STORAGE, MatrixValue, prepareFile } from './test-fixtures';

export const testMatrix: Array<MatrixValue> = ['local'];

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3');
}

const localDefaultStorage = {
  kind: 'local',
  type: 'file',
  storagePath: TEMP_STORAGE,
} as const;

const s3DefaultStorage: StorageConfig = {
  kind: 's3',
  type: 'file',
  bucketName: process.env.S3_BUCKET_NAME!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
};

const getRunner = ({ storageConfig }: { storageConfig: StorageConfig }) =>
  setupTestRunner({
    config: apiTestConfig({
      storage: {
        test_file: {
          ...localDefaultStorage,
          ...storageConfig,
        },
      },
      lists: {
        Test: list({
          fields: {
            name: text(),
            secretFile: file({ storage: 'test_file' }),
          },
        }),
      },
    }),
  });

const getFileHash = async (filename: string, matrixValue: MatrixValue) => {
  let contentFromURL = null;

  try {
    if (matrixValue === 's3') {
      contentFromURL = await fetch(filename).then(x => x.buffer());
    } else {
      contentFromURL = await fs.readFile(path.join(TEMP_STORAGE, filename));
    }
  } catch (e) {}

  return contentFromURL && createHash('sha1').update(contentFromURL).digest('hex');
};

describe('Crud special tests', () => {
  afterAll(() => {
    if (testMatrix.includes('local')) {
      // This matches the storagePath in the keystone config in the various test files.
      fs.rmdirSync(TEMP_STORAGE, { recursive: true });
    }
  });

  const filename = 'keystone.jpeg';
  const fileHash = createHash('sha1')
    .update(fs.readFileSync(path.resolve(`${__dirname}/../test-files/${filename}`)))
    .digest('hex');

  const createItem = (context: any) =>
    context.query.Test.createOne({
      data: { secretFile: prepareFile(filename) },
      query: `
        id
        secretFile {
          filename
          __typename
          filesize
          url
        }
    `,
    });

  describe('Create - upload', () => {
    for (let matrixValue of testMatrix) {
      test(
        'Upload values should match expected corrected',
        getRunner({ storageConfig: matrixValue === 's3' ? s3DefaultStorage : localDefaultStorage })(
          async ({ context }) => {
            const data = await createItem(context);
            expect(data).not.toBe(null);

            expect(data.secretFile).toEqual({
              /*
                The url and filename here include a hash, and currently what we are doing
                is just checking the url is modified correctly - that said, this sucks
                as a test
                */
              url:
                matrixValue === 's3'
                  ? expect.stringContaining(`/${data.secretFile.filename}`)
                  : `/files/${data.secretFile.filename}`,
              filename: data.secretFile.filename,
              __typename: 'FileFieldOutput',
              filesize: 3250,
            });
            // check file exists at location
            expect(fileHash).toEqual(await getFileHash(data.secretFile.filename, matrixValue));
          }
        )
      );
    }
  });

  describe('After Operation Hook', () => {
    for (let matrixValue of testMatrix) {
      test(
        'without delete',
        getRunner({ storageConfig: matrixValue === 's3' ? s3DefaultStorage : localDefaultStorage })(
          async ({ context }) => {
            const {
              id,
              secretFile: { filename },
            } = await createItem(context);

            console.log(filename);
            expect(await getFileHash(filename, matrixValue)).toBeTruthy();

            const {
              secretFile: { filename: filename2 },
            } = await context.query.Test.updateOne({
              where: { id },
              data: { secretFile: prepareFile('thinkmill.jpg') },
              query: `secretFile { filename }`,
            });

            expect(await getFileHash(filename, matrixValue)).toBeTruthy();
            expect(await getFileHash(filename2, matrixValue)).toBeTruthy();

            await context.query.Test.deleteOne({ where: { id } });

            expect(await getFileHash(filename, matrixValue)).toBeTruthy();
            // TODO test that just nulling the field doesn't delete it
          }
        )
      );
      test(
        'with delete',
        getRunner({
          storageConfig:
            matrixValue === 's3'
              ? { ...s3DefaultStorage, removeFileOnDelete: true }
              : { ...localDefaultStorage, removeFileOnDelete: true },
        })(async ({ context }) => {
          const {
            id,
            secretFile: { filename },
          } = await createItem(context);

          expect(await getFileHash(filename, matrixValue)).toBeTruthy();

          const {
            secretFile: { filename: filename2 },
          } = await context.query.Test.updateOne({
            where: { id },
            data: { secretFile: prepareFile('thinkmill.jpg') },
            query: `
                secretFile {
                  filename
                }`,
          });

          expect(await getFileHash(filename2, matrixValue)).toBeTruthy();
          expect(await getFileHash(filename, matrixValue)).toBeFalsy();

          await context.query.Test.deleteOne({ where: { id } });

          expect(await getFileHash(filename2, matrixValue)).toBeFalsy();

          // TODO test that just nulling the field removes the file
        })
      );
    }
  });
});
