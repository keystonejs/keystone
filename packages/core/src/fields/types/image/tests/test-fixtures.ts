import path from 'path';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import mime from 'mime';
import { KeystoneConfig } from '../../../../types';
import { image } from '..';

export const prepareFile = (_filePath: string) => {
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

export type MatrixValue = 's3' | 'local';

export const fieldConfig = () => ({ storage: 'test_image' });

export const TEMP_STORAGE = 'tmp_test_images';

export const getRootConfig = (matrixValue: MatrixValue): Partial<KeystoneConfig> => {
  if (matrixValue === 'local') {
    return {
      storage: {
        test_image: {
          type: 'image',
          kind: 'local',
          storagePath: TEMP_STORAGE,
        },
      },
    };
  }
  return {
    storage: {
      image_test: {
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

export const getTestFields = () => ({ avatar: image({ storage: 'fake-storage' }) });

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
