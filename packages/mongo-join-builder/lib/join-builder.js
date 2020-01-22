const { flatten, defaultObj } = require('@keystonejs/utils');

/**
 * Format of input object:

  type Query {
    relationships: { <String>: Relationship },
    matchTerm: Object,
    postJoinPipeline: [ Object ],
  }

  type Relationship: {
    from: String,
    field: String,
    many?: Boolean, (default: true)
    ...Query,
  }

  eg;
  {
    relationships: {
      abc123: {
        from: 'posts-collection',
        field: 'posts',
        many: true,
        matchTerm: { title: { $eq: 'hello' } },
        postJoinPipeline: [
          { $limit: 10 },
        ],
        relationships: {
          ...
        },
      },
    },
    matchTerm: { $and: {
      { name: { $eq: 'foobar' } },
      { age: { $eq: 23 } },
      { abc123_posts_some: { $eq: true } }
    },
    postJoinPipeline: [
      { $orderBy: 'name' },
    ],
  }
 */

function relationshipPipeline(relationship) {
  const { field, many, from, uniqueField } = relationship.relationshipInfo;
  return [
    {
      $lookup: {
        from,
        as: uniqueField,
        // We use `ifNull` here to handle the case unique to mongo where a record may be
        // entirely missing a field (or have the value set to `null`).
        let: { tmpVar: many ? { $ifNull: [`$${field}`, []] } : `$${field}` },
        pipeline: [
          // The ID / list of IDs we're joining by. Do this very first so it limits any work
          // required in subsequent steps / $and's.
          { $match: { $expr: { [many ? '$in' : '$eq']: ['$_id', `$$tmpVar`] } } },
          ...pipelineBuilder(relationship),
        ],
      },
    },
  ];
}

function pipelineBuilder({ relationships, matchTerm, excludeFields, postJoinPipeline }) {
  excludeFields.push(...relationships.map(({ relationshipInfo }) => relationshipInfo.uniqueField));
  return [
    ...flatten(relationships.map(relationshipPipeline)),
    matchTerm && { $match: matchTerm },
    { $addFields: { id: '$_id' } },
    excludeFields && excludeFields.length && { $project: defaultObj(excludeFields, 0) },
    ...postJoinPipeline, // $search / $orderBy / $skip / $first / $count
  ].filter(i => i);
}

module.exports = { pipelineBuilder };
