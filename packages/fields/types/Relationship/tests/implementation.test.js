const Relationship = require('../').implementation;

class MockFieldAdapter {}

class MockListAdapter {
  newFieldAdapter = () => new MockFieldAdapter();
  prepareModel = () => {};
}

function createRelationship({ path, config = {} }) {
  return new Relationship(path, config, {
    getListByKey: () => {},
    listKey: 'FakeList',
    listAdapter: new MockListAdapter(),
    fieldAdapterClass: MockFieldAdapter,
    defaultAccess: true,
  });
}

describe('Type Generation', () => {
  test('IDs for relationship fields in create args', () => {
    const relMany = createRelationship({ path: 'foo', config: { many: true } });
    expect(relMany.getGraphqlCreateArgs()).toEqual('foo: [ID]');

    const relSingle = createRelationship({
      path: 'foo',
      config: { many: false },
    });
    expect(relSingle.getGraphqlCreateArgs()).toEqual('foo: ID');
  });

  test('IDs for relationship fields in update args', () => {
    const relMany = createRelationship({ path: 'foo', config: { many: true } });
    expect(relMany.getGraphqlUpdateArgs()).toEqual('foo: [ID]');

    const relSingle = createRelationship({
      path: 'foo',
      config: { many: false },
    });
    expect(relSingle.getGraphqlUpdateArgs()).toEqual('foo: ID');
  });
});
