const { queryParser, pipelineBuilder, mutationBuilder } = require('../');
const { listAdapter } = require('./utils');

describe('Test main export', () => {
  test('throws if listAdapter is non-Object', async () => {
    expect(() => queryParser({ listAdapter: undefined }, { name: 'foobar' })).toThrow(Error);

    // Shouldn't throw
    await queryParser({ listAdapter }, { name: 'foobar' });
  });

  test('runs the query', async () => {
    const query = {
      AND: [
        { name: 'foobar' },
        { age: 23 },
        { posts_every: { AND: [{ title: 'hello' }, { tags_some: { name: 'foo' } }] } },
      ],
    };
    const queryTree = queryParser({ listAdapter, getUID: jest.fn(key => key) }, query);

    const aggregateResponse = [
      {
        name: 'foobar',
        age: 23,
        posts: [1, 3], // the IDs are stored on the field
        posts_every_posts: [
          // this is the join result
          {
            id: 1,
            title: 'hello',
            tags: [4, 5],
            tags_some_tags: [
              {
                id: 4,
                name: 'foo',
              },
              {
                id: 5,
                name: 'foo',
              },
            ],
          },
          {
            id: 3,
            title: 'hello',
            tags: [6],
            tags_some_tags: [
              {
                id: 6,
                name: 'foo',
              },
            ],
          },
        ],
      },
    ];
    const pipeline = pipelineBuilder(queryTree);
    const postQueryMutations = mutationBuilder(queryTree.relationships);

    const aggregate = jest.fn(() => Promise.resolve(aggregateResponse));
    const result = await aggregate(pipeline).then(postQueryMutations);
    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'posts_every_posts',
          let: { posts_every_posts_ids: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$posts_every_posts_ids'] } } },
            {
              $lookup: {
                from: 'tags',
                as: 'tags_some_tags',
                let: { tags_some_tags_ids: { $ifNull: ['$tags', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tags_some_tags_ids'] } } },
                  { $match: { name: { $eq: 'foo' } } },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                tags_some_tags_every: {
                  $eq: [{ $size: '$tags_some_tags' }, { $size: { $ifNull: ['$tags', []] } }],
                },
                tags_some_tags_none: { $eq: [{ $size: '$tags_some_tags' }, 0] },
                tags_some_tags_some: { $gt: [{ $size: '$tags_some_tags' }, 0] },
              },
            },
            {
              $match: {
                $and: [{ title: { $eq: 'hello' } }, { tags_some_tags_some: true }],
              },
            },
            {
              $addFields: { id: '$_id' },
            },
          ],
        },
      },
      {
        $addFields: {
          posts_every_posts_every: {
            $eq: [{ $size: '$posts_every_posts' }, { $size: { $ifNull: ['$posts', []] } }],
          },
          posts_every_posts_none: { $eq: [{ $size: '$posts_every_posts' }, 0] },
          posts_every_posts_some: { $gt: [{ $size: '$posts_every_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { posts_every_posts_every: true },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
    ]);

    expect(result).toMatchObject([
      {
        name: 'foobar',
        age: 23,
        posts: [1, 3],
      },
    ]);
  });
});
