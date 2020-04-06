const { pipelineBuilder } = require('../lib/join-builder');

describe('join builder', () => {
  test('correctly generates joins for simple queries', () => {
    /*
     * From this query:

      {
        name: 'foobar',
        age: 23,
      }

    */
    const pipeline = pipelineBuilder({
      matchTerm: { $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
      postJoinPipeline: [],
      excludeFields: [],
      relationships: [],
    });

    expect(pipeline).toMatchObject([
      { $match: { $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] } },
      { $addFields: { id: '$_id' } },
    ]);
  });

  test('correctly generates joins for to-one relationships', () => {
    /*
     * From this query:

      {
        title: 'foobar',
        views: 23,
        author: {
          name: 'Alice',
        },
      }

    */
    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: { name: { $eq: 'Alice' } },
          relationshipInfo: {
            from: 'users',
            field: 'author',
            many: false,
            uniqueField: 'abc123_author',
          },
          excludeFields: [],
          postJoinPipeline: [],
          relationships: [],
        },
      ],
      matchTerm: {
        $and: [
          { title: { $eq: 'foobar' } },
          { views: { $eq: 23 } },
          { $expr: { $eq: [{ $size: '$abc123_author' }, 1] } },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'users',
          as: 'abc123_author',
          let: { tmpVar: '$author' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$tmpVar'] } } },
            { $match: { name: { $eq: 'Alice' } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { title: { $eq: 'foobar' } },
            { views: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$abc123_author' }, 1] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_author: 0 } },
    ]);
  });

  test('correctly generates joins for relationships with no filters', () => {
    /*
     * From this query:

      {
        name: 'foobar',
        age: 23,
        posts_every: {},
      }

    */
    const pipeline = pipelineBuilder({
      relationships: [
        {
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'abc123_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [],
        },
      ],
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { $expr: { $gt: [{ $size: '$abc123_posts' }, 0] } },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'abc123_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $gt: [{ $size: '$abc123_posts' }, 0] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0 } },
    ]);
  });

  test('correctly generates joins for relationships with postJoinPipeline', () => {
    /*
     * From this query:

      {
        name: 'foobar',
        age: 23,
        posts_every: {},
      }

    */
    const pipeline = pipelineBuilder({
      relationships: [
        {
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'abc123_posts',
          },
          postJoinPipeline: [{ $orderBy: 'title' }],
          relationships: [],
          excludeFields: [],
        },
      ],
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: { $ifNull: ['$posts', []] } }] } },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [{ $limit: 10 }],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'abc123_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            { $addFields: { id: '$_id' } },
            { $orderBy: 'title' },
          ],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: { $ifNull: ['$posts', []] } }] },
            },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0 } },
      { $limit: 10 },
    ]);
  });

  test('correctly generates joins for nested relationships', () => {
    /*
     * From this query:

      {
        name: 'foobar',
        age: 23,
        posts_every: {
          title: 'hello',
          tags_some: {
            name: 'React',
            posts_every: {
              published: true,
            },
          },
        },
      }

    */
    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: {
            $and: [{ title: { $eq: 'hello' } }, { $expr: { $gt: [{ $size: '$def456_tags' }, 0] } }],
          },
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'abc123_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: {
                $and: [
                  { name: { $eq: 'React' } },
                  {
                    $expr: {
                      $eq: [{ $size: '$xyz890_posts' }, { $size: { $ifNull: ['$posts', []] } }],
                    },
                  },
                ],
              },
              relationshipInfo: {
                from: 'tags',
                field: 'tags',
                many: true,
                uniqueField: 'def456_tags',
              },
              postJoinPipeline: [],
              excludeFields: [],
              relationships: [
                {
                  matchTerm: { published: { $eq: true } },
                  relationshipInfo: {
                    from: 'posts',
                    field: 'posts',
                    many: true,
                    uniqueField: 'xyz890_posts',
                  },
                  postJoinPipeline: [],
                  excludeFields: [],
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
          { $expr: { $gt: [{ $size: '$abc123_posts' }, 0] } },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'abc123_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'tags',
                as: 'def456_tags',
                let: { tmpVar: { $ifNull: ['$tags', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'posts',
                      as: 'xyz890_posts',
                      let: { tmpVar: { $ifNull: ['$posts', []] } },
                      pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                        { $match: { published: { $eq: true } } },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },

                  {
                    $match: {
                      $and: [
                        { name: { $eq: 'React' } },
                        {
                          $expr: {
                            $eq: [
                              { $size: '$xyz890_posts' },
                              { $size: { $ifNull: ['$posts', []] } },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                  { $project: { xyz890_posts: 0 } },
                ],
              },
            },
            {
              $match: {
                $and: [
                  { title: { $eq: 'hello' } },
                  { $expr: { $gt: [{ $size: '$def456_tags' }, 0] } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
            { $project: { def456_tags: 0 } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $gt: [{ $size: '$abc123_posts' }, 0] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0 } },
    ]);
  });

  test('correctly generates joins with nested AND', () => {
    /*
     * From this query:

      {
        AND: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      }
    */

    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: {
            $and: [
              { title: { $eq: 'hello' } },
              { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
            ],
          },
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'zip567_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'labels',
                field: 'labels',
                many: true,
                uniqueField: 'quux987_labels',
              },
              postJoinPipeline: [],
              excludeFields: [],
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
              $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
            },
          },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'zip567_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'labels',
                as: 'quux987_labels',
                let: { tmpVar: { $ifNull: ['$labels', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                  { $match: { name: { $eq: 'foo' } } },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $match: {
                $and: [
                  { title: { $eq: 'hello' } },
                  { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
            { $project: { quux987_labels: 0 } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
              },
            },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0 } },
    ]);
  });

  test('correctly generates joins with nested OR', () => {
    /*
     * From this query:

      {
        OR: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              OR: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      }
    */

    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: {
            $or: [
              { title: { $eq: 'hello' } },
              { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
            ],
          },
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'zip567_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'labels',
                field: 'labels',
                many: true,
                uniqueField: 'quux987_labels',
              },
              postJoinPipeline: [],
              excludeFields: [],
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
              $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
            },
          },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'zip567_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'labels',
                as: 'quux987_labels',
                let: { tmpVar: { $ifNull: ['$labels', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                  { $match: { name: { $eq: 'foo' } } },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $match: {
                $or: [
                  { title: { $eq: 'hello' } },
                  { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
            { $project: { quux987_labels: 0 } },
          ],
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
              },
            },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0 } },
    ]);
  });

  test('correctly generates joins with nested AND/OR', () => {
    /*
     * From this query:

      {
        AND: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              OR: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      }
    */

    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: {
            $or: [
              { title: { $eq: 'hello' } },
              { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
            ],
          },

          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'zip567_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'labels',
                field: 'labels',
                many: true,
                uniqueField: 'quux987_labels',
              },
              postJoinPipeline: [],
              excludeFields: [],
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
              $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
            },
          },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'zip567_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'labels',
                as: 'quux987_labels',
                let: { tmpVar: { $ifNull: ['$labels', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                  { $match: { name: { $eq: 'foo' } } },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $match: {
                $or: [
                  { title: { $eq: 'hello' } },
                  { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
            { $project: { quux987_labels: 0 } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: {
                $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }],
              },
            },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0 } },
    ]);
  });

  test('correctly generates joins with nested OR/AND', () => {
    /*
     * From this query:

      {
        OR: [
          { name: 'foobar' },
          { age: 23 },
          {
            posts_every: {
              AND: [{ title: 'hello' }, { labels_some: { name: 'foo' } }],
            },
          },
        ],
      }
    */

    const pipeline = pipelineBuilder({
      relationships: [
        {
          matchTerm: {
            $and: [
              { title: { $eq: 'hello' } },
              { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
            ],
          },
          relationshipInfo: {
            from: 'posts',
            field: 'posts',
            many: true,
            uniqueField: 'zip567_posts',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'labels',
                field: 'labels',
                many: true,
                uniqueField: 'quux987_labels',
              },
              postJoinPipeline: [],
              excludeFields: [],
              relationships: [],
            },
          ],
        },
      ],
      matchTerm: {
        $or: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }] } },
        ],
      },
      excludeFields: [],
      postJoinPipeline: [],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts',
          as: 'zip567_posts',
          let: { tmpVar: { $ifNull: ['$posts', []] } },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'labels',
                as: 'quux987_labels',
                let: { tmpVar: { $ifNull: ['$labels', []] } },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', '$$tmpVar'] } } },
                  { $match: { name: { $eq: 'foo' } } },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $match: {
                $and: [
                  { title: { $eq: 'hello' } },
                  { $expr: { $gt: [{ $size: '$quux987_labels' }, 0] } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
            { $project: { quux987_labels: 0 } },
          ],
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            {
              $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: { $ifNull: ['$posts', []] } }] },
            },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0 } },
    ]);
  });
});
