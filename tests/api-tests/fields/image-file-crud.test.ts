import path from 'path';
import { createHash } from 'crypto';
import os from 'os';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import { file, text, image } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { KeystoneConfig, StorageConfig } from '@keystone-6/core/types';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectSingleResolverError } from '../utils';

const fieldPath = path.resolve(__dirname, '../../..', 'packages/core/src/fields/types');

export const prepareFile = (_filePath: string, kind: 'image' | 'file') => {
  const filePath = path.resolve(fieldPath, kind, 'test-files', _filePath);
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

type MatrixValue = 's3' | 'local';
export const testMatrix: Array<MatrixValue> = ['local'];

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3');
}

const s3DefaultStorage = {
  kind: 's3',
  bucketName: process.env.S3_BUCKET_NAME!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
} as const;

const getRunner = ({
  storage,
  fields,
}: {
  storage: Record<string, StorageConfig>;
  fields: KeystoneConfig['lists'][string]['fields'];
}) =>
  setupTestRunner({
    config: apiTestConfig({
      db: {},
      storage,
      lists: {
        Test: list({
          fields: {
            name: text(),
            ...fields,
          },
        }),
      },
    }),
  });

const getFileHash = async (
  filename: string,
  config: { matrixValue: 's3' } | { matrixValue: 'local'; folder: string }
) => {
  let contentFromURL = null;

  try {
    if (config.matrixValue === 's3') {
      contentFromURL = await fetch(filename).then(x => x.buffer());
    } else {
      contentFromURL = await fs.readFile(path.join(config.folder, filename));
    }
  } catch (e) {}

  return contentFromURL && createHash('sha1').update(contentFromURL).digest('hex');
};

describe('File - Crud special tests', () => {
  const filename = 'keystone.jpeg';
  const fileHash = createHash('sha1')
    .update(fs.readFileSync(path.resolve(fieldPath, 'image/test-files', filename)))
    .digest('hex');

  const createItem = (context: any) =>
    context.query.Test.createOne({
      data: { secretFile: prepareFile(filename, 'image') },
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

  for (let matrixValue of testMatrix) {
    const getConfig = (): StorageKind => ({
      ...(matrixValue === 's3'
        ? { ...s3DefaultStorage, type: 'file' }
        : {
            kind: 'local',
            type: 'file',
            storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'file-local-test')),
          }),
    });

    const fields = { secretFile: file({ storage: 'test_file' }) };

    describe(matrixValue, () => {
      describe('Create - upload', () => {
        const config = getConfig();
        const hashConfig =
          config.kind === 'local'
            ? { matrixValue: config.kind, folder: config.storagePath! }
            : { matrixValue: config.kind };
        test(
          'Upload values should match expected corrected',
          getRunner({ storage: { test_file: config }, fields })(async ({ context }) => {
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
            expect(fileHash).toEqual(await getFileHash(data.secretFile.filename, hashConfig));
          })
        );
      });

      describe('After Operation Hook', () => {
        const config = getConfig();
        const hashConfig =
          config.kind === 'local'
            ? { matrixValue: config.kind, folder: config.storagePath! }
            : { matrixValue: config.kind };
        test(
          'without delete',
          getRunner({ storage: { test_file: config }, fields })(async ({ context }) => {
            const {
              id,
              secretFile: { filename },
            } = await createItem(context);

            expect(await getFileHash(filename, hashConfig)).toBeTruthy();

            const {
              secretFile: { filename: filename2 },
            } = await context.query.Test.updateOne({
              where: { id },
              data: { secretFile: prepareFile('thinkmill.jpg', 'file') },
              query: `secretFile { filename }`,
            });

            expect(await getFileHash(filename, hashConfig)).toBeTruthy();
            expect(await getFileHash(filename2, hashConfig)).toBeTruthy();

            await context.query.Test.deleteOne({ where: { id } });

            expect(await getFileHash(filename, hashConfig)).toBeTruthy();
            // TODO test that just nulling the field doesn't delete it
          })
        );
        test(
          'with delete',
          getRunner({
            storage: { test_file: { ...config, removeFileOnDelete: true } },
            fields,
          })(async ({ context }) => {
            const {
              id,
              secretFile: { filename },
            } = await createItem(context);

            expect(await getFileHash(filename, hashConfig)).toBeTruthy();

            const {
              secretFile: { filename: filename2 },
            } = await context.query.Test.updateOne({
              where: { id },
              data: { secretFile: prepareFile('thinkmill.jpg', 'file') },
              query: `
                secretFile {
                  filename
                }`,
            });

            expect(await getFileHash(filename2, hashConfig)).toBeTruthy();
            expect(await getFileHash(filename, hashConfig)).toBeFalsy();

            await context.query.Test.deleteOne({ where: { id } });

            expect(await getFileHash(filename2, hashConfig)).toBeFalsy();

            // TODO test that just nulling the field removes the file
          })
        );
      });
    });
  }
});

describe('Image - Crud special tests', () => {
  const createItem = async (context: any, filename: string) =>
    await context.query.Test.createOne({
      data: { avatar: prepareFile(filename, 'image') },
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

  for (let matrixValue of testMatrix) {
    const getConfig = (): StorageKind => ({
      ...(matrixValue === 's3'
        ? { ...s3DefaultStorage, type: 'image' }
        : {
            kind: 'local',
            type: 'image',
            storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'image-local-test')),
          }),
    });
    const fields = { avatar: image({ storage: 'test_image' }) };
    const config = getConfig();
    const hashConfig =
      config.kind === 'local'
        ? { matrixValue: config.kind, folder: config.storagePath! }
        : { matrixValue: config.kind };

    describe(matrixValue, () => {
      describe('Create - upload', () => {
        for (let matrixValue of testMatrix) {
          test(
            'upload values should match expected',
            getRunner({ fields, storage: { test_image: config } })(async ({ context }) => {
              const filenames = ['keystone.jpeg', 'keystone.jpg', 'keystone'];
              for (const filename of filenames) {
                const fileHash = createHash('sha1')
                  .update(fs.readFileSync(path.resolve(fieldPath, 'image/test-files', filename)))
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
                  await getFileHash(data.avatar.url.replace('/images', ''), hashConfig)
                );
              }
            })
          );
          test(
            'if not image file, throw',
            getRunner({ fields, storage: { test_image: config } })(async ({ context }) => {
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
                variables: { item: { avatar: prepareFile('badfile.txt', 'image') } },
              });
              expect(data).toEqual({ createTest: null });
              const message = `File type not found`;
              expectSingleResolverError(errors, 'createTest', 'Test.avatar', message);
            })
          );

          describe('After Operation Hook', () => {
            test(
              'without delete',
              getRunner({ fields, storage: { test_image: config } })(async ({ context }) => {
                const ogFilename = 'keystone.jpeg';

                const { id, avatar } = await createItem(context, ogFilename);

                await context.query.Test.updateOne({
                  where: { id },
                  data: { avatar: prepareFile('thinkmill.jpg', 'image') },
                });

                expect(
                  await getFileHash(`${avatar.id}.${avatar.extension}`, hashConfig)
                ).toBeTruthy();

                await context.query.Test.deleteOne({ where: { id } });

                expect(
                  await getFileHash(`${avatar.id}.${avatar.extension}`, hashConfig)
                ).toBeTruthy();
                // TODO test that just nulling the field doesn't delete it
              })
            );

            test(
              'with delete',
              getRunner({
                fields,
                storage: { test_image: { ...config, removeFileOnDelete: true } },
              })(async ({ context }) => {
                const ogFilename = 'keystone.jpeg';
                const { id, avatar } = await createItem(context, ogFilename);
                const filename = `${avatar.id}.${avatar.extension}`;

                expect(await getFileHash(filename, hashConfig)).toBeTruthy();
                const { avatar: avatar2 } = await context.query.Test.updateOne({
                  where: { id },
                  data: { avatar: prepareFile('thinkmill.jpg', 'image') },
                  query: `avatar {
                        id
                        extension
                      }`,
                });

                const filename2 = `${avatar2.id}.${avatar2.extension}`;

                expect(await getFileHash(filename, hashConfig)).toBeFalsy();
                expect(await getFileHash(filename2, hashConfig)).toBeTruthy();

                await context.query.Test.deleteOne({ where: { id } });

                expect(await getFileHash(filename2, hashConfig)).toBeFalsy();

                // TODO test that just nulling the field removes the file
              })
            );
          });
        }
      });
    });
  }
});
