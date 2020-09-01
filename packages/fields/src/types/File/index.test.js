import { multiAdapterRunners, setupServer } from '@keystonejs/test-utils';
import { createItem } from '@keystonejs/server-side-graphql-client';
import { LocalFileAdapter } from '@keystonejs/file-adapters';
import { Upload } from 'graphql-upload';
import globby from 'globby';
import mime from 'mime';
import fs from 'fs';
import path from 'path';

import File from './';
const directory = './upload';
const fileAdapter = new LocalFileAdapter({ src: directory, path: '/upload' });

// Grab all the image files from the directory
const testFiles = globby.sync(`packages/**/src/**/File/test-files/**`, { absolute: true });

const prepareFile = filePath => {
  const filename = path.basename(filePath);
  const mimetype = mime.getType(filePath);
  const createReadStream = () => fs.createReadStream(filePath);
  const encoding = 'utf-8';
  const upload = new Upload();
  upload.resolve({ createReadStream, filename, mimetype, encoding });
  return upload;
};

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Test', {
        fields: {
          name: { type: String },
          image: { type: File, adapter: fileAdapter },
        },
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('create', () => {
      afterAll(() => {
        fs.readdir(directory, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
              if (err) throw err;
            });
          }
        });
      });
      test(
        'createItem: Should create and get single item',
        runner(setupKeystone, async ({ keystone }) => {
          // Seed the db
          const item = await createItem({
            keystone,
            listKey: 'Test',
            returnFields: 'name image { originalFilename }',
            item: { name: 'test', image: prepareFile(testFiles[0]) },
          });
          expect(item.name).toBe('test');
          expect(item.image.originalFilename).toBe('Pointer.png');
        })
      );
    });
  })
);
