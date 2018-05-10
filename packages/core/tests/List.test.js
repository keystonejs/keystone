const { Mongoose } = require('mongoose');
const List = require('../List');

class MockType {
  addToMongooseSchema = jest.fn();
};

const config = {
  fields: {
    name: { type: {
      implementation: MockType,
      views: {
        viewType1: 'viewPath1',
        viewType2: 'viewPath2',
      },
    } },
    email: { type: {
      implementation: MockType,
      views: {
        viewType3: 'viewPath3',
        viewType4: 'viewPath4',
      },
    }, },
  }
};

describe('new List()', () => {

  test('new List() - Smoke test', () => {
    const list = new List('Test', config, { mongoose: new Mongoose(), lists: [] });
    expect(list).not.toBeNull();
  });

  test('new List() - labels', () => {
    const list = new List('Test', config, { mongoose: new Mongoose(), lists: [] });
    expect(list.label).toEqual('Tests');
    expect(list.singular).toEqual('Test');
    expect(list.plural).toEqual('Tests');
    expect(list.path).toEqual('tests');
    expect(list.itemQueryName).toEqual('Test');
    expect(list.listQueryName).toEqual('allTests');
    expect(list.listQueryMetaName).toEqual('_allTestsMeta');
    expect(list.deleteMutationName).toEqual('deleteTest');
    expect(list.deleteManyMutationName).toEqual('deleteTests');
    expect(list.updateMutationName).toEqual('updateTest');
    expect(list.createMutationName).toEqual('createTest');
  });

  test('new List() - fields', () => {
    const list = new List('Test', config, { mongoose: new Mongoose(), lists: [] });
    expect(list.fields).toHaveLength(2);
    expect(list.fields[0]).toBeInstanceOf(MockType);
    expect(list.fields[1]).toBeInstanceOf(MockType);
  });

  test('new List() - views', () => {
    const list = new List('Test', config, { mongoose: new Mongoose(), lists: [] });
    expect(list.views).toEqual({
      name: {
        viewType1: 'viewPath1',
        viewType2: 'viewPath2',
      },
      email: {
        viewType3: 'viewPath3',
        viewType4: 'viewPath4',
      }
    });
  });
});
