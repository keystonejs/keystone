// import { ProviderName } from '@keystone-next/test-utils-legacy';
import path from 'path';
import fs from 'fs-extra';
import { Upload } from 'graphql-upload';
import {
  createItem,
  //   deleteItem,
  //   getItems,
  //   getItem,
  //   updateItem,
} from '@keystone-next/server-side-graphql-client-legacy';
import mime from 'mime';

import { text } from '../../text';
import { image } from '..';

const prepareFile = (_filePath: string) => {
  const filePath = path.resolve(`packages-next/fields/src/types/image/test-files/${_filePath}`);
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

// const withHelpers = (wrappedFn: (args: any) => void | Promise<void>) => {
//                 return async ({
//                   context,
//                   listKey,
//                 }: {
//                   context: KeystoneContext;
//                   listKey: string;
//                 }) => {
//                   const items = await getItems({
//                     context,
//                     listKey,
//                     returnFields,
//                     sortBy: 'name_ASC',
//                   });
//                   return wrappedFn({ context, listKey, items });
//                 };
//               };

export const name = 'Image';
export const typeFunction = image;

export const exampleValue = () => prepareFile('keystone.jpg');
export const exampleValue2 = () => prepareFile('react.jpg');
export const createReturnedValue = 'jpg';
export const updateReturnedValue = createReturnedValue;

export const supportsUnique = false;
export const fieldName = 'avatar';
export const subfieldName = 'extension';

export const getTestFields = () => ({ name: text(), avatar: image() });

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
  test(
    'upload values should match expected',
    keystoneTestWrapper(async ({ context }: { context: any }) => {
      const filenames = ['keystone.jpeg', 'keystone.jpg', 'keystone'];
      for (const filename of filenames) {
        const data = await createItem({
          context,
          listKey: 'Test',
          item: { avatar: prepareFile(filename) },
          returnFields: `
            avatar {
              id
              mode
              filesize
              width
              height
              extension
              ref
              src
            }
        `,
        });
        expect(data).not.toBe(null);
        expect(data.avatar).toEqual({
          ref: `local:${data.avatar.id}.jpg`,
          src: `/images/${data.avatar.id}.jpg`,
          id: data.avatar.id,
          mode: 'local',
          filesize: 3250,
          width: 150,
          height: 152,
          extension: 'jpg',
        });
      }
    })
  );
  test(
    'if not image file, throw',
    keystoneTestWrapper(async ({ context }: { context: any }) => {
      const { data, errors } = await context.graphql.raw({
        query: `
            mutation ($item: TestCreateInput) {
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
      expect(errors).toHaveLength(1);
      expect(errors![0].message).toEqual('File type not found');
    })
  );
};
