const joinBuilder = require('../join-builder');

describe('join builder', () => {
  test('correctly generates joins for simple queries', () => {
    /*
     * From this query:

      {
        name: 'foobar',
        age: 23,
      }

    */
    const { pipeline } = joinBuilder({
      matchTerm: { $and: [{ name: { $eq: 'foobar' } }, { age: { $eq: 23 } }] },
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
    const { pipeline } = joinBuilder({
      relationships: {
        abc123: {
          from: 'user-collection',
          field: 'author',
          matchTerm: { name: { $eq: 'Alice' } },
          postQueryMutation: jest.fn(),
          many: false,
        },
      },
      matchTerm: {
        $and: [
          { title: { $eq: 'foobar' } },
          { views: { $eq: 23 } },
          { abc123_author_every: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'user-collection',
          as: 'abc123_author',
          let: { abc123_author_id: '$author' },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$_id', '$$abc123_author_id'] } },
                  { name: { $eq: 'Alice' } },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          abc123_author_every: { $eq: [{ $size: '$abc123_author' }, 1] },
          abc123_author_some: { $gt: [{ $size: '$abc123_author' }, 0] },
          abc123_author_none: { $eq: [{ $size: '$abc123_author' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { title: { $eq: 'foobar' } },
            { views: { $eq: 23 } },
            { abc123_author_every: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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
    const { pipeline } = joinBuilder({
      relationships: {
        abc123: {
          from: 'posts-collection',
          field: 'posts',
          postQueryMutation: jest.fn(),
          many: true,
        },
      },
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { abc123_posts_some: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'abc123_posts',
          let: { abc123_posts_ids: '$posts' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$abc123_posts_ids'] } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          abc123_posts_every: { $eq: [{ $size: '$abc123_posts' }, { $size: '$posts' }] },
          abc123_posts_none: { $eq: [{ $size: '$abc123_posts' }, 0] },
          abc123_posts_some: { $gt: [{ $size: '$abc123_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { abc123_posts_some: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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
    const { pipeline } = joinBuilder({
      relationships: {
        abc123: {
          from: 'posts-collection',
          field: 'posts',
          postJoinPipeline: [{ $orderBy: 'title' }],
          postQueryMutation: jest.fn(),
          many: true,
        },
      },
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { abc123_posts_some: { $eq: true } },
        ],
      },
      postJoinPipeline: [{ $limit: 10 }],
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'abc123_posts',
          let: { abc123_posts_ids: '$posts' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$abc123_posts_ids'] } } },
            { $addFields: { id: '$_id' } },
            { $orderBy: 'title' },
          ],
        },
      },
      {
        $addFields: {
          abc123_posts_every: { $eq: [{ $size: '$abc123_posts' }, { $size: '$posts' }] },
          abc123_posts_none: { $eq: [{ $size: '$abc123_posts' }, 0] },
          abc123_posts_some: { $gt: [{ $size: '$abc123_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { abc123_posts_some: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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
    const { pipeline } = joinBuilder({
      relationships: {
        abc123: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: { $and: [{ title: { $eq: 'hello' } }, { def456_tags_some: { $eq: true } }] },
          postQueryMutation: jest.fn(),
          many: true,
          relationships: {
            def456: {
              from: 'tags-collection',
              field: 'tags',
              matchTerm: {
                $and: [{ name: { $eq: 'React' } }, { xyz890_posts_every: { $eq: true } }],
              },
              postQueryMutation: jest.fn(),
              many: true,
              relationships: {
                xyz890: {
                  from: 'posts-collection',
                  field: 'posts',
                  matchTerm: { published: { $eq: true } },
                  postQueryMutation: jest.fn(),
                  many: true,
                },
              },
            },
          },
        },
      },
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { abc123_posts_some: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'abc123_posts',
          let: { abc123_posts_ids: '$posts' },
          pipeline: [
            {
              $lookup: {
                from: 'tags-collection',
                as: 'def456_tags',
                let: { def456_tags_ids: '$tags' },
                pipeline: [
                  {
                    $lookup: {
                      from: 'posts-collection',
                      as: 'xyz890_posts',
                      let: { xyz890_posts_ids: '$posts' },
                      pipeline: [
                        {
                          $match: {
                            $and: [
                              { $expr: { $in: ['$_id', '$$xyz890_posts_ids'] } },
                              { published: { $eq: true } },
                            ],
                          },
                        },
                        { $addFields: { id: '$_id' } },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      xyz890_posts_every: {
                        $eq: [{ $size: '$xyz890_posts' }, { $size: '$posts' }],
                      },
                      xyz890_posts_none: { $eq: [{ $size: '$xyz890_posts' }, 0] },
                      xyz890_posts_some: { $gt: [{ $size: '$xyz890_posts' }, 0] },
                    },
                  },
                  {
                    $match: {
                      $and: [
                        { $expr: { $in: ['$_id', '$$def456_tags_ids'] } },
                        {
                          $and: [{ name: { $eq: 'React' } }, { xyz890_posts_every: { $eq: true } }],
                        },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                def456_tags_every: { $eq: [{ $size: '$def456_tags' }, { $size: '$tags' }] },
                def456_tags_none: { $eq: [{ $size: '$def456_tags' }, 0] },
                def456_tags_some: { $gt: [{ $size: '$def456_tags' }, 0] },
              },
            },
            {
              $match: {
                $and: [
                  { $expr: { $in: ['$_id', '$$abc123_posts_ids'] } },
                  {
                    $and: [{ title: { $eq: 'hello' } }, { def456_tags_some: { $eq: true } }],
                  },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          abc123_posts_every: { $eq: [{ $size: '$abc123_posts' }, { $size: '$posts' }] },
          abc123_posts_none: { $eq: [{ $size: '$abc123_posts' }, 0] },
          abc123_posts_some: { $gt: [{ $size: '$abc123_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { abc123_posts_some: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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

    const { pipeline } = joinBuilder({
      relationships: {
        zip567: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: {
            $and: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
          },
          postQueryMutation: jest.fn(),
          many: true,
          relationships: {
            quux987: {
              from: 'labels-collection',
              field: 'labels',
              matchTerm: { name: { $eq: 'foo' } },
              postQueryMutation: jest.fn(),
              many: true,
            },
          },
        },
      },
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { zip567_posts_every: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'zip567_posts',
          let: { zip567_posts_ids: '$posts' },
          pipeline: [
            {
              $lookup: {
                from: 'labels-collection',
                as: 'quux987_labels',
                let: { quux987_labels_ids: '$labels' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $in: ['$_id', '$$quux987_labels_ids'] } },
                        { name: { $eq: 'foo' } },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                quux987_labels_every: { $eq: [{ $size: '$quux987_labels' }, { $size: '$labels' }] },
                quux987_labels_none: { $eq: [{ $size: '$quux987_labels' }, 0] },
                quux987_labels_some: { $gt: [{ $size: '$quux987_labels' }, 0] },
              },
            },
            {
              $match: {
                $and: [
                  { $expr: { $in: ['$_id', '$$zip567_posts_ids'] } },
                  {
                    $and: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
                  },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          zip567_posts_every: { $eq: [{ $size: '$zip567_posts' }, { $size: '$posts' }] },
          zip567_posts_none: { $eq: [{ $size: '$zip567_posts' }, 0] },
          zip567_posts_some: { $gt: [{ $size: '$zip567_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { zip567_posts_every: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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

    const { pipeline } = joinBuilder({
      relationships: {
        zip567: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: { $or: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }] },
          postQueryMutation: jest.fn(),
          many: true,
          relationships: {
            quux987: {
              from: 'labels-collection',
              field: 'labels',
              matchTerm: { name: { $eq: 'foo' } },
              postQueryMutation: jest.fn(),
              many: true,
            },
          },
        },
      },
      matchTerm: {
        $or: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { zip567_posts_every: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'zip567_posts',
          let: { zip567_posts_ids: '$posts' },
          pipeline: [
            {
              $lookup: {
                from: 'labels-collection',
                as: 'quux987_labels',
                let: { quux987_labels_ids: '$labels' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $in: ['$_id', '$$quux987_labels_ids'] } },
                        { name: { $eq: 'foo' } },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                quux987_labels_every: { $eq: [{ $size: '$quux987_labels' }, { $size: '$labels' }] },
                quux987_labels_none: { $eq: [{ $size: '$quux987_labels' }, 0] },
                quux987_labels_some: { $gt: [{ $size: '$quux987_labels' }, 0] },
              },
            },
            {
              $match: {
                $and: [
                  { $expr: { $in: ['$_id', '$$zip567_posts_ids'] } },
                  {
                    $or: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
                  },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          zip567_posts_every: { $eq: [{ $size: '$zip567_posts' }, { $size: '$posts' }] },
          zip567_posts_none: { $eq: [{ $size: '$zip567_posts' }, 0] },
          zip567_posts_some: { $gt: [{ $size: '$zip567_posts' }, 0] },
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { zip567_posts_every: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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

    const { pipeline } = joinBuilder({
      relationships: {
        zip567: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: { $or: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }] },
          postQueryMutation: jest.fn(),
          many: true,
          relationships: {
            quux987: {
              from: 'labels-collection',
              field: 'labels',
              matchTerm: { name: { $eq: 'foo' } },
              postQueryMutation: jest.fn(),
              many: true,
            },
          },
        },
      },
      matchTerm: {
        $and: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { zip567_posts_every: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'zip567_posts',
          let: { zip567_posts_ids: '$posts' },
          pipeline: [
            {
              $lookup: {
                from: 'labels-collection',
                as: 'quux987_labels',
                let: { quux987_labels_ids: '$labels' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $in: ['$_id', '$$quux987_labels_ids'] } },
                        { name: { $eq: 'foo' } },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                quux987_labels_every: { $eq: [{ $size: '$quux987_labels' }, { $size: '$labels' }] },
                quux987_labels_none: { $eq: [{ $size: '$quux987_labels' }, 0] },
                quux987_labels_some: { $gt: [{ $size: '$quux987_labels' }, 0] },
              },
            },
            {
              $match: {
                $and: [
                  { $expr: { $in: ['$_id', '$$zip567_posts_ids'] } },
                  {
                    $or: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
                  },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          zip567_posts_every: { $eq: [{ $size: '$zip567_posts' }, { $size: '$posts' }] },
          zip567_posts_none: { $eq: [{ $size: '$zip567_posts' }, 0] },
          zip567_posts_some: { $gt: [{ $size: '$zip567_posts' }, 0] },
        },
      },
      {
        $match: {
          $and: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { zip567_posts_every: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
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

    const { pipeline } = joinBuilder({
      relationships: {
        zip567: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: {
            $and: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
          },
          postQueryMutation: jest.fn(),
          many: true,
          relationships: {
            quux987: {
              from: 'labels-collection',
              field: 'labels',
              matchTerm: { name: { $eq: 'foo' } },
              postQueryMutation: jest.fn(),
              many: true,
            },
          },
        },
      },
      matchTerm: {
        $or: [
          { name: { $eq: 'foobar' } },
          { age: { $eq: 23 } },
          { zip567_posts_every: { $eq: true } },
        ],
      },
    });

    expect(pipeline).toMatchObject([
      {
        $lookup: {
          from: 'posts-collection',
          as: 'zip567_posts',
          let: { zip567_posts_ids: '$posts' },
          pipeline: [
            {
              $lookup: {
                from: 'labels-collection',
                as: 'quux987_labels',
                let: { quux987_labels_ids: '$labels' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $in: ['$_id', '$$quux987_labels_ids'] } },
                        { name: { $eq: 'foo' } },
                      ],
                    },
                  },
                  { $addFields: { id: '$_id' } },
                ],
              },
            },
            {
              $addFields: {
                quux987_labels_every: { $eq: [{ $size: '$quux987_labels' }, { $size: '$labels' }] },
                quux987_labels_none: { $eq: [{ $size: '$quux987_labels' }, 0] },
                quux987_labels_some: { $gt: [{ $size: '$quux987_labels' }, 0] },
              },
            },
            {
              $match: {
                $and: [
                  { $expr: { $in: ['$_id', '$$zip567_posts_ids'] } },
                  {
                    $and: [{ title: { $eq: 'hello' } }, { quux987_labels_some: { $eq: true } }],
                  },
                ],
              },
            },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      {
        $addFields: {
          zip567_posts_every: { $eq: [{ $size: '$zip567_posts' }, { $size: '$posts' }] },
          zip567_posts_none: { $eq: [{ $size: '$zip567_posts' }, 0] },
          zip567_posts_some: { $gt: [{ $size: '$zip567_posts' }, 0] },
        },
      },
      {
        $match: {
          $or: [
            { name: { $eq: 'foobar' } },
            { age: { $eq: 23 } },
            { zip567_posts_every: { $eq: true } },
          ],
        },
      },
      { $addFields: { id: '$_id' } },
    ]);
  });

  test('executes relationship mutators with correct parameters', () => {
    // TODO - check it's called with these params:
    /*
     * From this query:

      {
        age: 23,
        posts_every: { title: 'hello' },
      }
    */

    const mutationResult = {};
    const postQueryMutation = jest.fn(() => mutationResult);

    const { mutator } = joinBuilder({
      relationships: {
        zip567: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: { title: { $eq: 'hello' } },
          postQueryMutation,
          many: true,
        },
      },
      matchTerm: { $and: [{ age: { $eq: 23 } }, { zip567_posts_every: { $eq: true } }] },
    });

    /*
      {
        age: 23,
        posts_every: { title: 'hello' },
      }
    */
    const mockResult1 = {
      age: 23,
      name: 'foobar',
      zip567_posts: [
        {
          title: 'hello',
          views: 73,
        },
        {
          title: 'hello',
          views: 57,
        },
      ],
    };

    const mockResult2 = {
      age: 23,
      name: 'quux',
      zip567_posts: [
        {
          title: 'hello',
          views: 123,
        },
        {
          title: 'hello',
          views: 1,
        },
      ],
    };

    const mockQueryResult = [mockResult1, mockResult2];

    const mutatedResult = mutator(mockQueryResult);

    // (parentValue, keyOfRelationship, rootObject, path)
    expect(postQueryMutation).toHaveBeenCalledTimes(2);
    expect(postQueryMutation).toHaveBeenCalledWith(mockResult1, 'zip567_posts', mockQueryResult, [
      0,
    ]);
    expect(postQueryMutation).toHaveBeenCalledWith(mockResult2, 'zip567_posts', mockQueryResult, [
      1,
    ]);
    expect(mutatedResult).toMatchObject([mutationResult, mutationResult]);
  });

  test('executes nested relationship mutators with correct parameters', () => {
    let abc123_mutationResult;
    const abc123_postQueryMutation = jest.fn(objToMutate => {
      abc123_mutationResult = {
        ...objToMutate,
        abc123_mutated: true,
      };
      return abc123_mutationResult;
    });

    let def456_mutationResult;
    //const def456_postQueryMutation = jest.fn(() => def456_mutationResult);
    const def456_postQueryMutation = jest.fn(objToMutate => {
      def456_mutationResult = {
        ...objToMutate,
        def456_mutated: true,
      };
      return def456_mutationResult;
    });

    let xyz890_mutationResult;
    //const xyz890_postQueryMutation = jest.fn(() => xyz890_mutationResult);
    const xyz890_postQueryMutation = jest.fn(objToMutate => {
      xyz890_mutationResult = {
        ...objToMutate,
        xyz890_mutated: true,
      };
      return xyz890_mutationResult;
    });

    /*
     * From this query:

      {
        posts_every: {
          tags_some: {
            posts_every: {
              published: true,
            },
          },
        },
      }

    */
    const { mutator } = joinBuilder({
      relationships: {
        abc123: {
          from: 'posts-collection',
          field: 'posts',
          matchTerm: { def456_tags_some: { $eq: true } },
          postQueryMutation: abc123_postQueryMutation,
          many: true,
          relationships: {
            def456: {
              from: 'tags-collection',
              field: 'tags',
              matchTerm: { xyz890_posts_every: { $eq: true } },
              postQueryMutation: def456_postQueryMutation,
              many: true,
              relationships: {
                xyz890: {
                  from: 'posts-collection',
                  field: 'posts',
                  matchTerm: { published: { $eq: true } },
                  postQueryMutation: xyz890_postQueryMutation,
                  many: true,
                },
              },
            },
          },
        },
      },
      matchTerm: { abc123_posts_some: { $eq: true } },
    });

    /*
      {
        posts_every: {
          tags_some: {
            posts_every: {
              published: true,
            },
          },
        },
      }
    */
    const mockQueryResult = [
      {
        abc123_posts: [
          {
            def456_tags: [
              {
                xyz890_posts: [{ published: true, title: 'zap' }],
              },
            ],
          },
        ],
      },
      {
        abc123_posts: [
          {
            def456_tags: [
              {
                xyz890_posts: [{ published: true, title: 'bang' }],
              },
              {
                xyz890_posts: [
                  { published: true, title: 'itchy' },
                  { published: true, title: 'scratchy' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const mutatedResult = mutator(mockQueryResult);

    // xyz890 relationship
    expect(xyz890_postQueryMutation).toHaveBeenCalledTimes(3);
    // Only sanity check one invokation
    expect(xyz890_postQueryMutation).toHaveBeenCalledWith(
      mockQueryResult[1].abc123_posts[0].def456_tags[1],
      'xyz890_posts',
      mockQueryResult,
      [1, 'abc123_posts', 0, 'def456_tags', 1]
    );

    // def456 relationship
    expect(def456_postQueryMutation).toHaveBeenCalledTimes(2);
    // Only sanity check one invokation
    expect(def456_postQueryMutation).toHaveBeenCalledWith(
      {
        def456_tags: [
          {
            xyz890_mutated: true,
            xyz890_posts: [{ published: true, title: 'bang' }],
          },
          {
            xyz890_mutated: true,
            xyz890_posts: [
              { published: true, title: 'itchy' },
              { published: true, title: 'scratchy' },
            ],
          },
        ],
      },
      'def456_tags',
      [
        {
          abc123_posts: [
            {
              def456_tags: [
                {
                  xyz890_mutated: true,
                  xyz890_posts: [{ published: true, title: 'zap' }],
                },
              ],
            },
          ],
        },
        {
          abc123_posts: [
            {
              def456_tags: [
                {
                  xyz890_mutated: true,
                  xyz890_posts: [{ published: true, title: 'bang' }],
                },
                {
                  xyz890_mutated: true,
                  xyz890_posts: [
                    { published: true, title: 'itchy' },
                    { published: true, title: 'scratchy' },
                  ],
                },
              ],
            },
          ],
        },
      ],
      [1, 'abc123_posts', 0]
    );

    // (parentValue, keyOfRelationship, rootObject, path)
    // abc123 relationship
    expect(abc123_postQueryMutation).toHaveBeenCalledTimes(2);
    // Only sanity check one invokation
    expect(abc123_postQueryMutation).toHaveBeenCalledWith(
      {
        abc123_posts: [
          {
            def456_mutated: true,
            def456_tags: [
              {
                xyz890_mutated: true,
                xyz890_posts: [{ published: true, title: 'zap' }],
              },
            ],
          },
        ],
      },
      'abc123_posts',
      [
        {
          abc123_posts: [
            {
              def456_mutated: true,
              def456_tags: [
                {
                  xyz890_mutated: true,
                  xyz890_posts: [{ published: true, title: 'zap' }],
                },
              ],
            },
          ],
        },
        {
          abc123_posts: [
            {
              def456_mutated: true,
              def456_tags: [
                {
                  xyz890_mutated: true,
                  xyz890_posts: [{ published: true, title: 'bang' }],
                },
                {
                  xyz890_mutated: true,
                  xyz890_posts: [
                    { published: true, title: 'itchy' },
                    { published: true, title: 'scratchy' },
                  ],
                },
              ],
            },
          ],
        },
      ],
      [0]
    );

    expect(mutatedResult).toMatchObject([
      {
        abc123_mutated: true,
        abc123_posts: [
          {
            def456_mutated: true,
            def456_tags: [
              {
                xyz890_mutated: true,
                xyz890_posts: [{ published: true, title: 'zap' }],
              },
            ],
          },
        ],
      },
      {
        abc123_mutated: true,
        abc123_posts: [
          {
            def456_mutated: true,
            def456_tags: [
              {
                xyz890_mutated: true,
                xyz890_posts: [{ published: true, title: 'bang' }],
              },
              {
                xyz890_mutated: true,
                xyz890_posts: [
                  { published: true, title: 'itchy' },
                  { published: true, title: 'scratchy' },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
