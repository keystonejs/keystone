const { mergeRelationships, unmergeRelationships, createRelationships } = require('./utils');
const { Text, Relationship } = require('@keystonejs/fields');

describe('mergeRelationships', () => {
  test('merges relationships', () => {
    const merged = mergeRelationships(
      {
        User: [
          { name: 'Jess', id: 1 },
          { name: 'Tici', id: 2 },
          { name: 'Lauren', id: 3 },
        ],
        Post: [
          { title: 'Hello world', id: 'abc123' },
          { title: 'Foo Article', id: 'def789' },
          { title: 'A Thinking!', id: 'xyz765' },
        ],
      },
      {
        Post: {
          0: { author: 1 },
          1: { author: 3 },
          2: { author: 2 },
        },
      },
    );

    expect(merged).toEqual({
      User: [
        { name: 'Jess', id: 1 },
        { name: 'Tici', id: 2 },
        { name: 'Lauren', id: 3 },
      ],
      Post: [
        { title: 'Hello world', id: 'abc123', author: 1 },
        { title: 'Foo Article', id: 'def789', author: 3 },
        { title: 'A Thinking!', id: 'xyz765', author: 2 },
      ],
    });
  });

  test('merges sparse relationships', () => {
    const merged = mergeRelationships(
      {
        User: [
          { name: 'Jess', id: 1 },
          { name: 'Tici', id: 2 },
          { name: 'Lauren', id: 3 },
        ],
        Post: [
          { title: 'Hello world', id: 'abc123' },
          { title: 'Foo Article', id: 'def789' },
          { title: 'A Thinking!', id: 'xyz765' },
        ],
      },
      {
        Post: {
          0: { author: 1 },
          2: { author: 2 },
        },
      },
    );

    expect(merged).toEqual({
      User: [
        { name: 'Jess', id: 1 },
        { name: 'Tici', id: 2 },
        { name: 'Lauren', id: 3 },
      ],
      Post: [
        { title: 'Hello world', id: 'abc123', author: 1 },
        { title: 'Foo Article', id: 'def789' },
        { title: 'A Thinking!', id: 'xyz765', author: 2 },
      ],
    });
  });

  test('ignores unknown sparse relationships', () => {
    const merged = mergeRelationships(
      {
        User: [
          { name: 'Jess', id: 1 },
          { name: 'Tici', id: 2 },
          { name: 'Lauren', id: 3 },
        ],
        Post: [
          { title: 'Hello world', id: 'abc123' },
          { title: 'Foo Article', id: 'def789' },
          { title: 'A Thinking!', id: 'xyz765' },
        ],
      },
      {
        Post: {
          0: { author: 1 },
          // 4 is not a valid index
          4: { author: 2 },
        },
      },
    );

    expect(merged).toEqual({
      User: [
        { name: 'Jess', id: 1 },
        { name: 'Tici', id: 2 },
        { name: 'Lauren', id: 3 },
      ],
      Post: [
        { title: 'Hello world', id: 'abc123', author: 1 },
        { title: 'Foo Article', id: 'def789' },
        { title: 'A Thinking!', id: 'xyz765' },
      ],
    });
  });

  test.skip('supports many-relationships', () => {
    throw new Error('Implement me');
  });
});

describe('unmergeRelationships', () => {
  // Immitate the shape of the lists objects. This is fragile and leaky, but I
  // can't think of a better way to do it beyond getting into a Dependency
  // Injection nightmare.
  const lists = {
    User: {
      config: {
        fields: {
          name: { type: Text },
        },
      },
    },
    Post: {
      config: {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
      },
    },
  };

  test('unmerges relationship fields', () => {
    const { data, relationships } = unmergeRelationships(
      lists,
      {
        User: [
          { name: 'Jess' },
          { name: 'Tici' },
          { name: 'Lauren' },
        ],
        Post: [
          { title: 'Hello world', author: { where: { name: 'Jess' } } },
          { title: 'Foo Article', author: { where: { name: 'Lauren' } } },
          { title: 'A Thinking!', author: { where: { name: 'Tici' } } },
        ],
      }
    );

    expect(data).toEqual({
      User: [
        { name: 'Jess' },
        { name: 'Tici' },
        { name: 'Lauren' },
      ],
      Post: [
        { title: 'Hello world' },
        { title: 'Foo Article' },
        { title: 'A Thinking!' },
      ],
    });

    expect(relationships).toEqual({
      Post: {
        0: { author: { where: { name: 'Jess' } } },
        1: { author: { where: { name: 'Lauren' } } },
        2: { author: { where: { name: 'Tici' } } },
      },
    });
  });

  test('treats non-relationship fields with a where clause as data', () => {
    const { data, relationships } = unmergeRelationships(
      lists,
      {
        User: [
          { name: 'Jess' },
          { name: 'Tici' },
          { name: 'Lauren' },
        ],
        Post: [
          { title: 'Hello world', author: { where: { name: 'Jess' } } },
          { title: { where: { name: 'Tici' } } },
        ],
      }
    );

    expect(data).toEqual({
      User: [
        { name: 'Jess' },
        { name: 'Tici' },
        { name: 'Lauren' },
      ],
      Post: [
        { title: 'Hello world' },
        { title: { where: { name: 'Tici' } } },
      ],
    });

    expect(relationships).toEqual({
      Post: {
        0: { author: { where: { name: 'Jess' } } },
      },
    });
  });

  test('returns sparse arrays for relationships', () => {
    const { data, relationships } = unmergeRelationships(
      lists,
      {
        User: [
          { name: 'Jess' },
          { name: 'Tici' },
          { name: 'Lauren' },
        ],
        Post: [
          { title: 'Hello world' },
          { title: 'A Thinking!', author: { where: { name: 'Tici' } } },
        ],
      }
    );

    expect(data).toEqual({
      User: [
        { name: 'Jess' },
        { name: 'Tici' },
        { name: 'Lauren' },
      ],
      Post: [
        { title: 'Hello world' },
        { title: 'A Thinking!' },
      ],
    });

    expect(relationships).toEqual({
      Post: {
        1: { author: { where: { name: 'Tici' } } },
      },
    });
  });

  test('returns empty object when no relationship fields', () => {
    const { data, relationships } = unmergeRelationships(
      lists,
      {
        User: [
          { name: 'Jess' },
          { name: 'Tici' },
          { name: 'Lauren' },
        ],
        Post: [
          { title: 'Hello world' },
          { title: 'A Thinking!' },
        ],
      }
    );

    expect(data).toEqual({
      User: [
        { name: 'Jess' },
        { name: 'Tici' },
        { name: 'Lauren' },
      ],
      Post: [
        { title: 'Hello world' },
        { title: 'A Thinking!' },
      ],
    });

    expect(relationships).toEqual({});
  });

  test.skip('supports many-relationships', () => {
    throw new Error('Implement me');
  });
});

describe('createRelationships', () => {
  const lists = {
    User: {
      key: 'User',
      config: {
        fields: {
          name: { type: Text },
        },
      },
      adapter: {
        findOne: jest.fn(),
        update: jest.fn(),
      },
    },
    Post: {
      key: 'Post',
      config: {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
      },
      adapter: {
        findOne: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    // Reset call counts, etc, back to normal
    lists.User.adapter.findOne.mockReset();
    lists.User.adapter.update.mockReset();
    lists.Post.adapter.findOne.mockReset();
    lists.Post.adapter.update.mockReset();
  });

  test('creates relationships', async () => {
    const relationships = {
      Post: {
        0: { author: { where: { name: 'Jess' } } },
        1: { author: { where: { name: 'Lauren' } } },
      },
    };

    const createdItems = {
      User: [
        {
          id: '456zyx',
          name: 'Jess',
        },
        {
          id: '789wer',
          name: 'Lauren',
        },
      ],
      Post: [
        {
          id: 'abc123',
          title: 'Foobar',
        },
        {
          id: 'def789',
          title: 'Hello',
        },
      ]
    };

    // Mocking the database calls
    lists.User.adapter.findOne
      .mockImplementation(({ name }) => (
        // Grab the first user with the matching name
        createdItems.User.filter(user => user.name === name)[0]
      ));

    lists.Post.adapter.update
      .mockImplementation((id, data) => ({
        // Create a new object with the data merged in
        ...createdItems.Post.filter(post => post.id === id)[0],
        ...data,
      }));

    const updatedRelationships = await createRelationships(lists, relationships, createdItems);

    expect(updatedRelationships).toEqual({
      Post: {
        0: { author: '456zyx' },
        1: { author: '789wer' },
      },
    });
  });

  test('Errors when where clause doesnt match any items', async () => {
    const relationships = {
      Post: {
        0: { author: { where: { name: 'BLAAAHHH' } } },
      },
    };

    const createdItems = {
      User: [
        {
          id: '456zyx',
          name: 'Jess',
        },
      ],
      Post: [
        {
          id: 'abc123',
          title: 'Foobar',
        },
      ]
    };

    // Mocking the database calls
    lists.User.adapter.findOne
      .mockImplementation(({ name }) => (
        // Grab the first user with the matching name
        createdItems.User.filter(user => user.name === name)[0]
      ));

    lists.Post.adapter.update
      .mockImplementation((id, data) => ({
        // Create a new object with the data merged in
        ...createdItems.Post.filter(post => post.id === id)[0],
        ...data,
      }));

    await expect(createRelationships(lists, relationships, createdItems)).rejects.toThrow(
      /Attempted to relate .* to a .*, but no .* matched the conditions .*/
    );
  });

  test('Uses the first matching item', async () => {
    // TODO - are we actually testing anything here, or are we only testing the
    // mock returns the thing we told it to return?
    const relationships = {
      Post: {
        0: { author: { where: { name: 'Jess' } } },
      },
    };

    const createdItems = {
      User: [
        {
          id: '456zyx',
          name: 'Jess',
        },
        {
          id: '789wer',
          name: 'Jess',
        },
      ],
      Post: [
        {
          id: 'abc123',
          title: 'Foobar',
        },
      ]
    };

    // Mocking the database calls
    lists.User.adapter.findOne
      .mockImplementation(({ name }) => (
        // Grab the first user with the matching name
        createdItems.User.filter(user => user.name === name)[0]
      ));

    lists.Post.adapter.update
      .mockImplementation((id, data) => ({
        // Create a new object with the data merged in
        ...createdItems.Post.filter(post => post.id === id)[0],
        ...data,
      }));

    const updatedRelationships = await createRelationships(lists, relationships, createdItems);

    expect(updatedRelationships).toEqual({
      Post: {
        0: { author: '456zyx' },
      },
    });
  });

  test.skip('Supports creating many-relationships', () => {
    // TODO, eg; User: { fields: { posts: { type: Relationship, many: true } } }
    throw new Error('Implement me');
  });

  test('is a noop for empty relations', async () => {
    const relationships = {};

    const createdItems = {
      User: [
        {
          id: '456zyx',
          name: 'Jess',
        },
      ],
      Post: [
        {
          id: 'abc123',
          title: 'Foobar',
        },
      ]
    };

    // Mocking the database calls
    lists.User.adapter.findOne
      .mockImplementation(({ name }) => (
        // Grab the first user with the matching name
        createdItems.User.filter(user => user.name === name)[0]
      ));

    lists.Post.adapter.update
      .mockImplementation((id, data) => ({
        // Create a new object with the data merged in
        ...createdItems.Post.filter(post => post.id === id)[0],
        ...data,
      }));

    const updatedRelationships = await createRelationships(lists, relationships, createdItems);

    expect(updatedRelationships).toEqual({});
  });

  test('is a noop for list of empty relations', async () => {
    const relationships = { Post: {} };

    const createdItems = {
      User: [
        {
          id: '456zyx',
          name: 'Jess',
        },
      ],
      Post: [
        {
          id: 'abc123',
          title: 'Foobar',
        },
      ]
    };

    // Mocking the database calls
    lists.User.adapter.findOne
      .mockImplementation(({ name }) => (
        // Grab the first user with the matching name
        createdItems.User.filter(user => user.name === name)[0]
      ));

    lists.Post.adapter.update
      .mockImplementation((id, data) => ({
        // Create a new object with the data merged in
        ...createdItems.Post.filter(post => post.id === id)[0],
        ...data,
      }));

    const updatedRelationships = await createRelationships(lists, relationships, createdItems);

    expect(updatedRelationships).toEqual({
      Post: {},
    });
  });
});
