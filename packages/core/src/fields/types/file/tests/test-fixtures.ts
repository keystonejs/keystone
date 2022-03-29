import path from 'path';
import { createHash } from 'crypto';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import fetch from 'node-fetch';
import { file } from '..';
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

const TEMP_STORAGE = 'tmp_test_files';

export const getRootConfig = (matrixValue: MatrixValue): Partial<KeystoneConfig> => {
  if (matrixValue === 'local') {
    return {
      storage: {
        test_file: {
          kind: 'local',
          type: 'file',
          storagePath: TEMP_STORAGE,
          removeFileOnDelete: true || false,
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

type MatrixValue = 's3' | 'local';

export const getTestFields = () => ({
  secretFile: file({ storage: 'test_file' }),
});

// TODO undesrtand why 'afterEach' was breaking tests
export const afterAll = async (matrixValue: MatrixValue) => {
  if (matrixValue === 'local') {
    // This matches the storagePath in the keystone config in the various test files.
    fs.rmdirSync(TEMP_STORAGE, { recursive: true });
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

const getFileHash = async (filename: string, matrixValue: MatrixValue) => {
  let contentFromURL = null;

  try {
    if (matrixValue === 's3') {
      contentFromURL = await fetch(filename).then(x => x.buffer());
    } else {
      console.log(path.join(TEMP_STORAGE, filename));
      contentFromURL = await fs.readFile(path.join(TEMP_STORAGE, filename));
    }
  } catch (e) {}

  return contentFromURL && createHash('sha1').update(contentFromURL).digest('hex');
};

export const crudTests = (keystoneTestWrapper: any) => {
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
    test(
      'upload values should match expected',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: MatrixValue }) => {
          const data = await createItem(context);
          expect(data).not.toBe(null);
          // check the graphql return type
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
  });
  describe('After Operation Hook', () => {
    test(
      'without delete',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: MatrixValue }) => {
          const {
            id,
            secretFile: { filename },
          } = await createItem(context);

          console.log(filename);
          expect(await getFileHash(filename, matrixValue)).toBeTruthy();

          await context.query.Test.updateOne({
            where: { id },
            data: { secretFile: prepareFile('thinkmill.jpg') },
          });

          expect(await getFileHash(filename, matrixValue)).toBeTruthy();

          await context.query.Test.deleteOne({ where: { id } });

          expect(await getFileHash(filename, matrixValue)).toBeTruthy();
          // TODO test that just nulling the field doesn't delete it
        }
      )
    );
    test(
      'with delete',
      keystoneTestWrapper(
        async ({ context, matrixValue }: { context: any; matrixValue: MatrixValue }) => {
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
        }
      )
    );
  });
};
