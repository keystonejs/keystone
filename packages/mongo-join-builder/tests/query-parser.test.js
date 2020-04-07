const { queryParser } = require('../lib/query-parser');
const { listAdapter } = require('./utils');

describe('query parser', () => {
  test('requires a listAdapter option', () => {
    expect(() => queryParser()).toThrow(Error);
    expect(() => queryParser({}, { name: 'foobar' })).toThrow(Error);
    expect(() => queryParser({ listAdapter }, { name: 'foobar' })).not.toThrow(Error);
  });

  test('requires an object for the query', () => {
    expect(() => {
      queryParser({ listAdapter }, 'foobar');
    }).toThrow(Error);
  });

  describe('calling tokenizing functions', () => {
    test('AND query with invalid query type', () => {
      expect(() => queryParser({ listAdapter }, { AND: [{ name: 'foobar' }, 23] })).toThrow(Error);
    });

    test('OR query with invalid query type', () => {
      expect(() => queryParser({ listAdapter }, { OR: [{ name: 'foobar' }, 23] })).toThrow(Error);
    });
  });

  describe('simple queries', () => {
    test('builds a simple query tree', () => {
      const queryTree = queryParser({ listAdapter }, { name: 'foobar', age: 23 });

      expect(queryTree).toMatchObject({
        // No relationships in this test
        relationships: [],
        matchTerm: { $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
      });
    });

    test('builds a query tree with ANDs', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => ({ matchTerm: { [key]: { $eq: query[key] } } })),
      };

      const queryTree = queryParser(
        { listAdapter, tokenizer },
        { AND: [{ name: 'foobar' }, { age: 23 }] }
      );

      expect(queryTree).toMatchObject({
        // No relationships in this test
        relationships: {},
        matchTerm: { $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
      });
    });

    test('builds a query tree with ORs', () => {
      const tokenizer = {
        simple: jest.fn((query, key) => ({ matchTerm: { [key]: { $eq: query[key] } } })),
      };

      const queryTree = queryParser(
        { listAdapter, tokenizer },
        { OR: [{ name: 'foobar' }, { age: 23 }] }
      );

      expect(queryTree).toMatchObject({
        // No relationships in this test
        relationships: [],
        matchTerm: { $or: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
      });
    });
  });

  describe('relationship queries', () => {
    test('builds a query tree with to-many relationship and other postjoin filters', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        { name: 'foobar', age: 23, $first: 1, posts: { title: 'hello', $orderBy: 'title_ASC' } }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: { title: { $eq: 'hello' } },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'only',
              farCollection: 'posts',
            },
            postJoinPipeline: [{ $sort: { title: 1 } }],
            relationships: [],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$posts_posts' }, 1] } },
          ],
        },
        postJoinPipeline: [{ $limit: 1 }],
      });
    });

    test('builds a query tree with to-many relationship', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        { name: 'foobar', age: 23, posts: { title: 'hello' } }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: { title: { $eq: 'hello' } },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'only',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$posts_posts' }, 1] } },
          ],
        },
      });
    });

    test('builds a query tree for a relationship with no filters', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        { name: 'foobar', age: 23, posts: {} }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: undefined,
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'only',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$posts_posts' }, 1] } },
          ],
        },
      });
    });

    test('builds a query tree with to-single relationship', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        { name: 'foobar', age: 23, company: { name: 'hello' } }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: { name: { $eq: 'hello' } },
            relationshipInfo: {
              from: 'company-collection',
              uniqueField: 'company_company',
              thisTable: 'User',
              rel: {},
              filterType: 'only',
              farCollection: 'company-collection',
            },
            postJoinPipeline: [],
            relationships: [],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$company_company' }, 1] } },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          name: 'foobar',
          age: 23,
          posts_every: {
            title: 'hello',
            tags_some: { name: 'React', posts_every: { title: 'foo' } },
          },
        }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: {
              $and: [
                { title: { $eq: 'hello' } },
                { $expr: { $gt: [{ $size: '$tags_some_tags' }, 0] } },
              ],
            },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_every_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'every',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [
              {
                matchTerm: {
                  $and: [
                    { name: { $eq: 'React' } },
                    {
                      $expr: {
                        $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
                      },
                    },
                  ],
                },
                relationshipInfo: {
                  from: 'posts_tags',
                  uniqueField: 'tags_some_tags',
                  thisTable: 'Post',
                  rel: {},
                  filterType: 'some',
                  farCollection: 'tags',
                },
                postJoinPipeline: [],
                relationships: [
                  {
                    matchTerm: { title: { $eq: 'foo' } },
                    relationshipInfo: {
                      from: 'posts_tags',
                      uniqueField: 'posts_every_posts',
                      thisTable: 'Tag',
                      rel: {},
                      filterType: 'every',
                      farCollection: 'posts',
                    },
                    postJoinPipeline: [],
                    relationships: [],
                  },
                ],
              },
            ],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
              },
            },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship with nested AND', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          AND: [
            { name: 'foobar' },
            { age: 23 },
            { posts_every: { AND: [{ title: 'hello' }, { tags_some: { name: 'foo' } }] } },
          ],
        }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: {
              $and: [
                { title: { $eq: 'hello' } },
                { $expr: { $gt: [{ $size: '$tags_some_tags' }, 0] } },
              ],
            },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_every_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'every',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [
              {
                matchTerm: { name: { $eq: 'foo' } },
                relationshipInfo: {
                  from: 'posts_tags',
                  uniqueField: 'tags_some_tags',
                  thisTable: 'Post',
                  rel: {},
                  filterType: 'some',
                  farCollection: 'tags',
                },
                postJoinPipeline: [],
                relationships: [],
              },
            ],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
              },
            },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship with nested OR', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          OR: [
            { name: 'foobar' },
            { age: 23 },
            { posts_every: { OR: [{ title: 'hello' }, { tags_some: { name: 'foo' } }] } },
          ],
        }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: {
              $or: [
                { title: { $eq: 'hello' } },
                { $expr: { $gt: [{ $size: '$tags_some_tags' }, 0] } },
              ],
            },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_every_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'every',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [
              {
                matchTerm: { name: { $eq: 'foo' } },
                relationshipInfo: {
                  from: 'posts_tags',
                  uniqueField: 'tags_some_tags',
                  thisTable: 'Post',
                  rel: {},
                  filterType: 'some',
                  farCollection: 'tags',
                },
                postJoinPipeline: [],
                relationships: [],
              },
            ],
          },
        ],
        matchTerm: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
              },
            },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship with nested AND/OR', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          AND: [
            { name: 'foobar' },
            { age: 23 },
            { posts_every: { OR: [{ title: 'hello' }, { tags_some: { name: 'foo' } }] } },
          ],
        }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: {
              $or: [
                { title: { $eq: 'hello' } },
                { $expr: { $gt: [{ $size: '$tags_some_tags' }, 0] } },
              ],
            },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_every_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'every',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [
              {
                matchTerm: { name: { $eq: 'foo' } },
                relationshipInfo: {
                  from: 'posts_tags',
                  uniqueField: 'tags_some_tags',
                  thisTable: 'Post',
                  rel: {},
                  filterType: 'some',
                  farCollection: 'tags',
                },
                postJoinPipeline: [],
                relationships: [],
              },
            ],
          },
        ],
        matchTerm: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
              },
            },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship with nested OR/AND', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          OR: [
            { name: 'foobar' },
            { age: 23 },
            { posts_every: { AND: [{ title: 'hello' }, { tags_some: { name: 'foo' } }] } },
          ],
        }
      );

      expect(queryTree).toMatchObject({
        relationships: [
          {
            matchTerm: {
              $and: [
                { title: { $eq: 'hello' } },
                { $expr: { $gt: [{ $size: '$tags_some_tags' }, 0] } },
              ],
            },
            relationshipInfo: {
              from: 'posts',
              uniqueField: 'posts_every_posts',
              thisTable: 'User',
              rel: {},
              filterType: 'every',
              farCollection: 'posts',
            },
            postJoinPipeline: [],
            relationships: [
              {
                matchTerm: { name: { $eq: 'foo' } },
                relationshipInfo: {
                  from: 'posts_tags',
                  uniqueField: 'tags_some_tags',
                  thisTable: 'Post',
                  rel: {},
                  filterType: 'some',
                  farCollection: 'tags',
                },
                postJoinPipeline: [],
                relationships: [],
              },
            ],
          },
        ],
        matchTerm: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$posts_every_posts' }, { $size: '$posts_every_posts_all' }],
              },
            },
          ],
        },
      });
    });

    test('builds a query tree with nested relationship with parallel OR/AND', () => {
      const queryTree = queryParser(
        { listAdapter, getUID: jest.fn(key => key) },
        {
          OR: [{ name: 'foobar' }, { age: 23 }],
          AND: [{ age: 30 }, { email: 'foo@bar.com' }],
        }
      );

      expect(queryTree).toMatchObject({
        relationships: {},
        matchTerm: {
          $and: [
            { $or: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
            { $and: [{ age: { $eq: 30 } }, { email: { $eq: 'foo@bar.com' } }] },
          ],
        },
      });
    });
  });
});
