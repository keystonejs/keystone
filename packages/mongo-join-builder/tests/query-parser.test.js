const queryParser = require('../query-parser');

describe('query parser', () => {
  test('requires a tokenizer option', () => {
    expect(() => queryParser()).toThrow(Error);
    expect(() => queryParser({})).toThrow(Error);
    expect(() => queryParser({ tokenizer: 'hello' })).toThrow(Error);
    expect(() => queryParser({ tokenizer: 10 })).toThrow(Error);

    // shouldn't throw
    queryParser({ tokenizer: {} });
  });

  describe('throws if tokenising function returns non-Object or non-Array', () => {
    test('simple', () => {
      expect(() => {
        const parser = queryParser({ tokenizer: { simple: () => undefined } });
        parser({ name: 'foobar' });
      }).toThrow(Error);

      expect(() => {
        const parser = queryParser({ tokenizer: { simple: () => 10 } });
        parser({ name: 'foobar' });
      }).toThrow(Error);

      expect(() => {
        const parser = queryParser({ tokenizer: { simple: () => 'hello' } });
        parser({ name: 'foobar' });
      }).toThrow(Error);

      // Shouldn't throw
      let parser = queryParser({ tokenizer: { simple: () => ({}) } });
      parser({ name: 'foobar' });

      // Shouldn't throw
      parser = queryParser({ tokenizer: { simple: () => [] } });
      parser({ name: 'foobar' });
    });

    test('relationship', () => {
      expect(() => {
        const parser = queryParser({ tokenizer: { relationship: () => undefined } });
        parser({ posts: {} });
      }).toThrow(Error);

      expect(() => {
        const parser = queryParser({ tokenizer: { relationship: () => 10 } });
        parser({ posts: {} });
      }).toThrow(Error);

      expect(() => {
        const parser = queryParser({ tokenizer: { relationship: () => 'hello' } });
        parser({ posts: {} });
      }).toThrow(Error);

      // Shouldn't throw
      const parser = queryParser({ tokenizer: { relationship: () => ({}) } });
      parser({ posts: {} });
    });
  });

  describe('calling tokenizing functions', () => {
    test('simple query', () => {
      const simpleTokenizer = {
        simple: jest.fn(() => []),
      };
      const parser = queryParser({ tokenizer: simpleTokenizer });

      parser({
        name: 'foobar',
        age_lte: 23,
      });

      expect(simpleTokenizer.simple).toBeCalledTimes(2);
      // Change path to array
      expect(simpleTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age_lte: 23,
        },
        'name',
        ['name']
      );
      expect(simpleTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age_lte: 23,
        },
        'age_lte',
        ['age_lte']
      );
    });

    test('single relationship query', () => {
      const complexTokenizer = {
        simple: jest.fn(() => []),
        relationship: jest.fn(() => ({})),
      };
      const parser = queryParser({ tokenizer: complexTokenizer });

      parser({
        name: 'foobar',
        age: 23,
        posts_every: {
          title: 'hello',
        },
      });

      expect(complexTokenizer.simple).toBeCalledTimes(3);
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
          },
        },
        'name',
        ['name']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
          },
        },
        'age',
        ['age']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          title: 'hello',
        },
        'title',
        ['posts_every', 'title']
      );

      expect(complexTokenizer.relationship).toBeCalledTimes(1);
      expect(complexTokenizer.relationship).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
          },
        },
        'posts_every',
        ['posts_every'],
        expect.any(String)
      );
    });

    test('nested relationship query', () => {
      const complexTokenizer = {
        simple: jest.fn(() => []),
        relationship: jest.fn(() => ({})),
      };
      const parser = queryParser({ tokenizer: complexTokenizer });

      parser({
        name: 'foobar',
        age: 23,
        posts_every: {
          title: 'hello',
          labels_some: {
            name: 'foo',
          },
        },
      });

      expect(complexTokenizer.simple).toBeCalledTimes(4);
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
            labels_some: {
              name: 'foo',
            },
          },
        },
        'name',
        ['name']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
            labels_some: {
              name: 'foo',
            },
          },
        },
        'age',
        ['age']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          title: 'hello',
          labels_some: {
            name: 'foo',
          },
        },
        'title',
        ['posts_every', 'title']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foo',
        },
        'name',
        ['posts_every', 'labels_some', 'name']
      );

      expect(complexTokenizer.relationship).toBeCalledTimes(2);
      expect(complexTokenizer.relationship).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
            labels_some: {
              name: 'foo',
            },
          },
        },
        'posts_every',
        ['posts_every'],
        expect.any(String)
      );
      expect(complexTokenizer.relationship).toBeCalledWith(
        {
          title: 'hello',
          labels_some: {
            name: 'foo',
          },
        },
        'labels_some',
        ['posts_every', 'labels_some'],
        expect.any(String)
      );
    });

    test('AND query', () => {
      const simpleTokenizer = {
        simple: jest.fn(() => []),
      };
      const parser = queryParser({ tokenizer: simpleTokenizer });

      parser({
        AND: [{ name: 'foobar' }, { age_lte: 23 }],
      });

      expect(simpleTokenizer.simple).toBeCalledTimes(2);
      expect(simpleTokenizer.simple).toBeCalledWith({ name: 'foobar' }, 'name', ['AND', 0, 'name']);
      expect(simpleTokenizer.simple).toBeCalledWith({ age_lte: 23 }, 'age_lte', [
        'AND',
        1,
        'age_lte',
      ]);
    });

    test('complex query with nested AND', () => {
      const complexTokenizer = {
        simple: jest.fn(() => []),
        relationship: jest.fn(() => ({})),
      };
      const parser = queryParser({ tokenizer: complexTokenizer });

      parser({
        name: 'foobar',
        age: 23,
        posts_every: {
          AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
        },
      });

      expect(complexTokenizer.simple).toBeCalledTimes(4);
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
          },
        },
        'name',
        ['name']
      );
      expect(complexTokenizer.simple).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
          },
        },
        'age',
        ['age']
      );
      expect(complexTokenizer.simple).toBeCalledWith({ title: 'hello' }, 'title', [
        'posts_every',
        'AND',
        0,
        'title',
      ]);
      expect(complexTokenizer.simple).toBeCalledWith({ name: 'foo' }, 'name', [
        'posts_every',
        'AND',
        1,
        'labels_some',
        'name',
      ]);

      expect(complexTokenizer.relationship).toBeCalledTimes(2);
      expect(complexTokenizer.relationship).toBeCalledWith(
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
          },
        },
        'posts_every',
        ['posts_every'],
        expect.any(String)
      );
      expect(complexTokenizer.relationship).toBeCalledWith(
        { labels_some: { name: 'foo' } },
        'labels_some',
        ['posts_every', 'AND', 1, 'labels_some'],
        expect.any(String)
      );
    });

    test('AND with nested complex query with nested AND', () => {
      const complexTokenizer = {
        simple: jest.fn(() => []),
        relationship: jest.fn(() => ({})),
      };
      const parser = queryParser({ tokenizer: complexTokenizer });

      parser({
        AND: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      });

      expect(complexTokenizer.simple).toBeCalledTimes(4);
      expect(complexTokenizer.simple).toBeCalledWith({ name: 'foobar' }, 'name', [
        'AND',
        0,
        'name',
      ]);
      expect(complexTokenizer.simple).toBeCalledWith({ age: 23 }, 'age', ['AND', 1, 'age']);
      expect(complexTokenizer.simple).toBeCalledWith({ title: 'hello' }, 'title', [
        'AND',
        2,
        'posts_every',
        'AND',
        0,
        'title',
      ]);
      expect(complexTokenizer.simple).toBeCalledWith({ name: 'foo' }, 'name', [
        'AND',
        2,
        'posts_every',
        'AND',
        1,
        'labels_some',
        'name',
      ]);

      expect(complexTokenizer.relationship).toBeCalledTimes(2);
      expect(complexTokenizer.relationship).toBeCalledWith(
        {
          posts_every: {
            AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
          },
        },
        'posts_every',
        ['AND', 2, 'posts_every'],
        expect.any(String)
      );
      expect(complexTokenizer.relationship).toBeCalledWith(
        { labels_some: { name: 'foo' } },
        'labels_some',
        ['AND', 2, 'posts_every', 'AND', 1, 'labels_some'],
        expect.any(String)
      );
    });
  });

  describe('simple queries', () => {
    test('builds a simple query tree', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
      };

      const parser = queryParser({ tokenizer });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
      });

      expect(queryTree).toMatchObject({
        // No relationships in this test
        relationships: {},
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
      });
    });

    test('builds a query tree with ANDs', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
      };

      const parser = queryParser({ tokenizer });

      const queryTree = parser({
        AND: [{ name: 'foobar' }, { age: 23 }],
      });

      expect(queryTree).toMatchObject({
        // No relationships in this test
        relationships: {},
        pipeline: [
          {
            $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }],
          },
        ],
      });
    });
  });

  describe('relationship queries', () => {
    test('builds a query tree with to-many relationship and other postjoin filters', () => {
      let relationPrefix;

      const tokenizer = {
        simple: jest.fn((query, key) => {
          const value = query[key];
          if (key.startsWith('$')) {
            return {
              postJoinPipeline: [{ [key]: value }],
            };
          }
          return {
            pipeline: [{ [key]: { $eq: value } }],
          };
        }),
        relationship: jest.fn((query, key, path, prefix) => {
          relationPrefix = prefix;
          const field = key;
          return {
            from: `${field}-collection`,
            field,
            postQueryMutation: () => {},
            match: { [`${prefix}${field}_every`]: { $eq: true } },
            many: true,
          };
        }),
      };

      const getUID = jest.fn(key => key);

      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
        $limit: 1,
        posts: {
          title: 'hello',
          $orderBy: 'title_ASC',
        },
      });

      expect(queryTree).toMatchObject({
        relationships: {
          posts: {
            from: 'posts-collection',
            field: 'posts',
            pipeline: [{ title: { $eq: 'hello' } }],
            match: { [`${relationPrefix}posts_every`]: { $eq: true } },
            postJoinPipeline: [{ $orderBy: 'title_ASC' }],
            postQueryMutation: expect.any(Function),
            many: true,
            relationships: expect.any(Object),
          },
        },
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
        postJoinPipeline: [{ $limit: 1 }],
      });
    });

    test('builds a query tree with to-many relationship', () => {
      let relationPrefix;

      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
        relationship: jest.fn((query, key, path, prefix) => {
          relationPrefix = prefix;
          const field = key;
          return {
            from: `${field}-collection`,
            field,
            postQueryMutation: () => {},
            match: { [`${prefix}${field}_every`]: { $eq: true } },
            many: true,
          };
        }),
      };

      const getUID = jest.fn(key => key);

      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
        posts: {
          title: 'hello',
        },
      });

      expect(queryTree).toMatchObject({
        relationships: {
          posts: {
            from: 'posts-collection',
            field: 'posts',
            pipeline: [{ title: { $eq: 'hello' } }],
            match: { [`${relationPrefix}posts_every`]: { $eq: true } },
            postQueryMutation: expect.any(Function),
            many: true,
            relationships: expect.any(Object),
          },
        },
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
      });
    });

    test('builds a query tree for a relationship with no filters', () => {
      let relationPrefix;

      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
        relationship: jest.fn((query, key, path, prefix) => {
          relationPrefix = prefix;
          const field = key;
          return {
            from: `${field}-collection`,
            field,
            postQueryMutation: () => {},
            match: { [`${prefix}${field}_every`]: { $eq: true } },
            many: true,
          };
        }),
      };

      const getUID = jest.fn(key => key);

      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
        posts: {},
      });

      expect(queryTree).toMatchObject({
        relationships: {
          posts: {
            from: 'posts-collection',
            field: 'posts',
            pipeline: [],
            match: { [`${relationPrefix}posts_every`]: { $eq: true } },
            postQueryMutation: expect.any(Function),
            many: true,
            relationships: expect.any(Object),
          },
        },
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
      });
    });

    test('builds a query tree with to-single relationship', () => {
      let relationPrefix;

      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
        relationship: jest.fn((query, key, path, prefix) => {
          relationPrefix = prefix;
          const field = key;
          return {
            from: `${field}-collection`,
            field,
            postQueryMutation: () => {},
            match: { [`${prefix}${field}_every`]: { $eq: true } },
            many: false,
          };
        }),
      };

      const getUID = jest.fn(key => key);

      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
        company: {
          name: 'hello',
        },
      });

      expect(queryTree).toMatchObject({
        relationships: {
          company: {
            from: 'company-collection',
            field: 'company',
            pipeline: [{ name: { $eq: 'hello' } }],
            match: { [`${relationPrefix}company_every`]: { $eq: true } },
            postQueryMutation: expect.any(Function),
            many: false,
          },
        },
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
      });
    });

    test('builds a query tree with nested relationship', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
        relationship: jest.fn((query, key) => {
          const [table] = key.split('_');
          return {
            from: `${table}-collection`,
            field: table,
            postQueryMutation: () => {},
            match: { [key]: { $eq: true } },
            many: true,
          };
        }),
      };

      const getUID = jest.fn(key => key);

      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        name: 'foobar',
        age: 23,
        posts_every: {
          title: 'hello',
          tags_some: {
            name: 'React',
            posts_every: {
              title: 'foo',
            },
          },
        },
      });

      expect(queryTree).toMatchObject({
        relationships: {
          posts_every: {
            from: 'posts-collection',
            field: 'posts',
            pipeline: [{ title: { $eq: 'hello' } }],
            match: { posts_every: { $eq: true } },
            postQueryMutation: expect.any(Function),
            many: true,
            relationships: {
              tags_some: {
                from: 'tags-collection',
                field: 'tags',
                pipeline: [{ name: { $eq: 'React' } }],
                match: { tags_some: { $eq: true } },
                postQueryMutation: expect.any(Function),
                many: true,
                relationships: {
                  posts_every: {
                    from: 'posts-collection',
                    field: 'posts',
                    pipeline: [{ title: { $eq: 'foo' } }],
                    match: { posts_every: { $eq: true } },
                    postQueryMutation: expect.any(Function),
                    many: true,
                  },
                },
              },
            },
          },
        },
        pipeline: [{ $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] }],
      });
    });

    test('builds a query tree with nested relationship with nested AND', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => [
          {
            [key]: { $eq: query[key] },
          },
        ]),
        relationship: jest.fn((query, key) => {
          const [table] = key.split('_');
          return {
            from: `${table}-collection`,
            field: table,
            postQueryMutation: () => {},
            match: { $exists: true, $ne: [] },
            many: true,
          };
        }),
      };

      const getUID = jest.fn(key => key);
      const parser = queryParser({ tokenizer, getUID });

      const queryTree = parser({
        AND: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      });

      expect(queryTree).toMatchObject({
        relationships: {
          posts_every: {
            from: 'posts-collection',
            pipeline: [{ title: { $eq: 'hello' } }],
            match: { $exists: true, $ne: [] },
            postQueryMutation: expect.any(Function),
            many: true,
            relationships: {
              labels_some: {
                from: 'labels-collection',
                pipeline: [{ name: { $eq: 'foo' } }],
                match: { $exists: true, $ne: [] },
                postQueryMutation: expect.any(Function),
                many: true,
              },
            },
          },
        },
        pipeline: [
          {
            $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }],
          },
        ],
      });
    });
  });
});
