/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const request = require('supertest');

const Keystone = require('../../core/Keystone');
const AdminUI = require('../../admin-ui/server/AdminUI');
const WebServer = require('../../server/WebServer');
const { MongooseAdapter } = require('../../adapter-mongoose');

const sorted = (arr, keyFn) => {
  arr = [...arr];
  arr.sort((a, b) => {
    a = keyFn(a);
    b = keyFn(b);
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  return arr;
};

export const runQuery = (app, snippet, fn) => {
  request(app)
    .post('/admin/api')
    .type('form')
    .send({ query: `query { ${snippet} }` })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect(200)
    .end((err, res) => {
      if (err !== null) {
        // Extract the error message to give more useful feedback during testing
        expect(JSON.parse(res.text).errors[0].message).toEqual('');
      }
      // expect(err).toBe(null);
      fn(res.body.data);
    });
};

export const matchFilter = (app, filter, fields, target, done, sortkey) => {
  filter = filter ? `(${filter})` : '';
  const snippet = `allTests ${filter} ${fields}`;
  runQuery(app, snippet, data => {
    const value = sortkey
      ? sorted(data.allTests || [], i => i[sortkey])
      : data.allTests;
    expect(value).toEqual(target);
    done();
  });
};

describe('Test CRUD for all fields', () => {
  const typesLoc = path.resolve('packages/fields/types');
  fs
    .readdirSync(typesLoc)
    .map(name => `${typesLoc}/${name}/filterTests.js`)
    .filter(filename => fs.existsSync(filename))
    .map(require)
    .forEach(mod => {
      describe(`All the CRUD tests for module: ${mod.name}`, () => {
        // Set up a keystone project for each type module to use
        const keystone = new Keystone({
          adapter: new MongooseAdapter(),
          name: 'Test Project',
        });

        // Create a list with all the fields required for testing
        const fields = mod.getTestFields();

        const listName = 'test';
        const labelResolver = item => item;

        keystone.createList(listName, { fields, labelResolver });

        // Set up a server (but do not .listen(), we will use supertest to access the app)
        const admin = new AdminUI(keystone, { adminPath: '/admin' });
        const server = new WebServer(keystone, {
          'cookie secret': 'qwerty',
          'admin ui': admin,
          session: false,
        });

        // Clear the database before running any tests
        beforeAll(async done => {
          keystone.connect();
          Object.values(keystone.adapters).forEach(async adapter => {
            await adapter.dropDatabase();
          });
          await keystone.createItems({ [listName]: mod.initItems() });

          // Throw at least one request at the server to make sure it's warmed up
          await request(server.app)
            .get('/admin')
            .expect(200);

          done();
          // Compiling can sometimes take a while
        }, 60000);

        describe('All Filter Tests', () => {
          mod.filterTests(server.app);
        });

        afterAll(async done => {
          Object.values(keystone.adapters).forEach(async adapter => {
            await adapter.close();
          });

          try {
            await admin.stopDevServer();
          } catch (err) {
            console.error(err);
            throw Error('Failed to close webpack middleware');
          } finally {
            done();
          }
        });
      });
    });
});
