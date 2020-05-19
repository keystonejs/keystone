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
            uniqueField: 'abc123_author',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'one',
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
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
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
            uniqueField: 'abc123_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
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
          { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $lookup: {
          from: 'posts',
          as: 'abc123_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0, abc123_posts_all: 0 } },
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
            uniqueField: 'abc123_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          postJoinPipeline: [{ $sortBy: 'title' }],
          relationships: [],
          excludeFields: [],
        },
      ],
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            { $addFields: { id: '$_id' } },
            { $sortBy: 'title' },
          ],
        },
      },
      {
        $lookup: {
          from: 'posts',
          as: 'abc123_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0, abc123_posts_all: 0 } },
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
          relationshipInfo: {
            from: 'posts',
            uniqueField: 'abc123_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          matchTerm: {
            $and: [{ title: { $eq: 'hello' } }, { $expr: { $gt: [{ $size: '$def456_tags' }, 0] } }],
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: {
                $and: [
                  { name: { $eq: 'React' } },
                  {
                    $expr: { $eq: [{ $size: '$xyz890_posts' }, { $size: '$xyz890_posts_all' }] },
                  },
                ],
              },
              relationshipInfo: {
                from: 'posts_tags',
                uniqueField: 'def456_tags',
                path: 'tags',
                rel: {
                  cardinality: 'N:N',
                  columnNames: {
                    'Post.tags': { near: 'Post_id', far: 'Tag_id' },
                    'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
                  },
                },
                thisTable: 'Post',
                filterType: 'some',
                farCollection: 'tags',
              },
              postJoinPipeline: [],
              excludeFields: [],
              relationships: [
                {
                  matchTerm: { published: { $eq: true } },
                  relationshipInfo: {
                    from: 'posts_tags',
                    uniqueField: 'xyz890_posts',
                    path: 'posts',
                    rel: {
                      cardinality: 'N:N',
                      columnNames: {
                        'Post.tags': { near: 'Post_id', far: 'Tag_id' },
                        'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
                      },
                      tableName: 'Posts_Tags',
                    },
                    thisTable: 'Tag',
                    filterType: 'every',
                    farCollection: 'posts',
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
          { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'posts_tags',
                as: 'def456_tags',
                let: { tmpVar: `$_id` },
                pipeline: [
                  { $match: { $expr: { $eq: [`$Post_id`, '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'tags',
                      as: 'def456_tags_0',
                      let: { tmpVar: '$Tag_id' },
                      pipeline: [
                        { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                        {
                          $lookup: {
                            from: 'posts_tags',
                            as: 'xyz890_posts',
                            let: { tmpVar: `$_id` },
                            pipeline: [
                              { $match: { $expr: { $eq: [`$Tag_id`, '$$tmpVar'] } } },
                              {
                                $lookup: {
                                  from: 'posts',
                                  as: 'xyz890_posts_0',
                                  let: { tmpVar: `$Post_id` },
                                  pipeline: [
                                    { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                                    { $match: { published: { $eq: true } } },
                                    { $addFields: { id: '$_id' } },
                                  ],
                                },
                              },
                              { $match: { $expr: { $gt: [{ $size: '$xyz890_posts_0' }, 0] } } },
                            ],
                          },
                        },
                        {
                          $lookup: {
                            from: 'posts_tags',
                            as: 'xyz890_posts_all',
                            let: { tmpVar: `$_id` },
                            pipeline: [
                              { $match: { $expr: { $eq: [`$Tag_id`, '$$tmpVar'] } } },
                              {
                                $lookup: {
                                  from: 'posts',
                                  as: 'xyz890_posts_0',
                                  let: { tmpVar: `$Post_id` },
                                  pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
                                },
                              },
                            ],
                          },
                        },
                        {
                          $match: {
                            $and: [
                              { name: { $eq: 'React' } },
                              {
                                $expr: {
                                  $eq: [{ $size: '$xyz890_posts' }, { $size: '$xyz890_posts_all' }],
                                },
                              },
                            ],
                          },
                        },
                        { $addFields: { id: '$_id' } },
                        { $project: { xyz890_posts: 0, xyz890_posts_all: 0 } },
                      ],
                    },
                  },
                  { $match: { $expr: { $gt: [{ $size: '$def456_tags_0' }, 0] } } },
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
        $lookup: {
          from: 'posts',
          as: 'abc123_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$abc123_posts' }, { $size: '$abc123_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { abc123_posts: 0, abc123_posts_all: 0 } },
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
            uniqueField: 'zip567_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'posts_labels',
                uniqueField: 'quux987_labels',
                path: 'labels',
                rel: {
                  cardinality: 'N:N',
                  columnNames: {
                    'Post.labels': { near: 'Post_id', far: 'Label_id' },
                    'Label.posts': { near: 'Label_id', far: 'Post_id' },
                  },
                },
                thisTable: 'Post',
                filterType: 'some',
                farCollection: 'labels',
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
          { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'posts_labels',
                as: 'quux987_labels',
                let: { tmpVar: `$_id` },
                pipeline: [
                  { $match: { $expr: { $eq: [`$Post_id`, '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'labels',
                      as: 'quux987_labels_0',
                      let: { tmpVar: `$Label_id` },
                      pipeline: [
                        { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                        { $match: { name: { $eq: 'foo' } } },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },
                  { $match: { $expr: { $gt: [{ $size: '$quux987_labels_0' }, 0] } } },
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
        $lookup: {
          from: 'posts',
          as: 'zip567_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0, zip567_posts_all: 0 } },
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
            uniqueField: 'zip567_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'posts_labels',
                uniqueField: 'quux987_labels',
                path: 'labels',
                rel: {
                  cardinality: 'N:N',
                  columnNames: {
                    'Post.labels': { near: 'Post_id', far: 'Label_id' },
                    'Label.posts': { near: 'Label_id', far: 'Post_id' },
                  },
                },
                thisTable: 'Post',
                filterType: 'some',
                farCollection: 'labels',
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
          { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'posts_labels',
                as: 'quux987_labels',
                let: { tmpVar: `$_id` },
                pipeline: [
                  { $match: { $expr: { $eq: [`$Post_id`, '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'labels',
                      as: 'quux987_labels_0',
                      let: { tmpVar: `$Label_id` },
                      pipeline: [
                        { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                        { $match: { name: { $eq: 'foo' } } },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },
                  { $match: { $expr: { $gt: [{ $size: '$quux987_labels_0' }, 0] } } },
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
        $lookup: {
          from: 'posts',
          as: 'zip567_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0, zip567_posts_all: 0 } },
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
            uniqueField: 'zip567_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'posts_labels',
                uniqueField: 'quux987_labels',
                path: 'labels',
                rel: {
                  cardinality: 'N:N',
                  columnNames: {
                    'Post.labels': { near: 'Post_id', far: 'Label_id' },
                    'Label.posts': { near: 'Label_id', far: 'Post_id' },
                  },
                },
                thisTable: 'Post',
                filterType: 'some',
                farCollection: 'labels',
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
              $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }],
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'posts_labels',
                as: 'quux987_labels',
                let: { tmpVar: `$_id` },
                pipeline: [
                  { $match: { $expr: { $eq: [`$Post_id`, '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'labels',
                      as: 'quux987_labels_0',
                      let: { tmpVar: `$Label_id` },
                      pipeline: [
                        { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                        { $match: { name: { $eq: 'foo' } } },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },
                  { $match: { $expr: { $gt: [{ $size: '$quux987_labels_0' }, 0] } } },
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
        $lookup: {
          from: 'posts',
          as: 'zip567_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0, zip567_posts_all: 0 } },
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
            uniqueField: 'zip567_posts',
            rel: { cardinality: '1:N', columnName: 'author' },
            filterType: 'every',
          },
          postJoinPipeline: [],
          excludeFields: [],
          relationships: [
            {
              matchTerm: { name: { $eq: 'foo' } },
              relationshipInfo: {
                from: 'posts_labels',
                uniqueField: 'quux987_labels',
                path: 'labels',
                rel: {
                  cardinality: 'N:N',
                  columnNames: {
                    'Post.labels': { near: 'Post_id', far: 'Label_id' },
                    'Label.posts': { near: 'Label_id', far: 'Post_id' },
                  },
                },
                thisTable: 'Post',
                filterType: 'some',
                farCollection: 'labels',
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
          { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
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
          let: { tmpVar: `$author` },
          pipeline: [
            { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
            {
              $lookup: {
                from: 'posts_labels',
                as: 'quux987_labels',
                let: { tmpVar: `$_id` },
                pipeline: [
                  { $match: { $expr: { $eq: [`$Post_id`, '$$tmpVar'] } } },
                  {
                    $lookup: {
                      from: 'labels',
                      as: 'quux987_labels_0',
                      let: { tmpVar: `$Label_id` },
                      pipeline: [
                        { $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } },
                        { $match: { name: { $eq: 'foo' } } },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },
                  { $match: { $expr: { $gt: [{ $size: '$quux987_labels_0' }, 0] } } },
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
        $lookup: {
          from: 'posts',
          as: 'zip567_posts_all',
          let: { tmpVar: `$author` },
          pipeline: [{ $match: { $expr: { $eq: [`$_id`, '$$tmpVar'] } } }],
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { $expr: { $eq: [{ $size: '$zip567_posts' }, { $size: '$zip567_posts_all' }] } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
      { $project: { zip567_posts: 0, zip567_posts_all: 0 } },
    ]);
  });
});
