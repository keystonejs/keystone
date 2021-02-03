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

const lookupStage = ({ from, as, targetKey, foreignKey, extraPipeline = [] }) => ({
  $lookup: {
    from,
    as,
    let: { tmpVar: `$${targetKey}` },
    pipeline: [{ $match: { $expr: { $eq: [`$${foreignKey}`, '$$tmpVar'] } } }, ...extraPipeline],
  },
});

function relationshipPipeline(relationship) {
  const { from, thisTable, path, rel, filterType, uniqueField } = relationship.relationshipInfo;
  const { cardinality, columnNames } = rel;
  const extraPipeline = pipelineBuilder(relationship);
  const extraField = `${uniqueField}_all`;
  if (cardinality !== 'N:N') {
    // Perform a single FK join
    let targetKey, foreignKey;
    // FIXME: I feel like the logic here could use some revie
    if (filterType !== 'only' && rel.right && rel.left.listKey === rel.right.listKey) {
      targetKey = '_id';
      foreignKey = rel.columnName;
    } else {
      targetKey = rel.tableName === thisTable ? rel.columnName : '_id';
      foreignKey = rel.tableName === thisTable ? '_id' : rel.columnName;
    }
    return [
      // Join against all the items which match the relationship filter condition
      lookupStage({ from, as: uniqueField, targetKey, foreignKey, extraPipeline }),
      // Match against *all* the items. Required for the _every condition.
      filterType === 'every' && lookupStage({ from, as: extraField, targetKey, foreignKey }),
    ];
  } else {
    // Perform a pair of joins through the join table
    const { farCollection } = relationship.relationshipInfo;
    const columnKey = `${thisTable}.${path}`;
    return [
      // Join against all the items which match the relationship filter condition
      lookupStage({
        from,
        as: uniqueField,
        targetKey: '_id',
        foreignKey: columnNames[columnKey].near,
        extraPipeline: [
          lookupStage({
            from: farCollection,
            as: `${uniqueField}_0`,
            targetKey: columnNames[columnKey].far,
            foreignKey: '_id',
            extraPipeline,
          }),
          { $match: { $expr: { $gt: [{ $size: `$${uniqueField}_0` }, 0] } } },
        ],
      }),
      // Match against *all* the items. Required for the _every condition.
      filterType === 'every' &&
        lookupStage({
          from,
          as: extraField,
          targetKey: '_id',
          foreignKey: columnNames[columnKey].near,
          extraPipeline: [
            lookupStage({
              from: farCollection,
              as: `${uniqueField}_0`,
              targetKey: columnNames[columnKey].far,
              foreignKey: '_id',
            }),
          ],
        }),
    ];
  }
}

function pipelineBuilder({ relationships, matchTerm, excludeFields, postJoinPipeline }) {
  excludeFields.push(
    ...flatten(
      relationships.map(({ relationshipInfo: { uniqueField, filterType } }) => [
        uniqueField,
        filterType === 'every' && `${uniqueField}_all`,
      ])
    ).filter(i => i)
  );
  return [
    ...flatten(relationships.map(relationshipPipeline)),
    matchTerm && { $match: matchTerm },
    { $addFields: { id: '$_id' } },
    excludeFields && excludeFields.length && { $project: defaultObj(excludeFields, 0) },
    ...postJoinPipeline, // $search / $orderBy / $skip / $first / $count
  ].filter(i => i);
}

module.exports = { pipelineBuilder };
