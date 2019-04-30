const { flatten } = require('@keystone-alpha/utils');

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
    postQueryMutation: Function,
    many?: Boolean, (default: true)
    ...Query,
  }

  eg;
  {
    relationships: {
      abc123: {
        from: 'posts-collection',
        field: 'posts',
        postQueryMutation: jest.fn(),
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
function joinBuilder(query) {
  return {
    pipeline: pipelineBuilder(query),
    postQueryMutations: mutationBuilder(query.relationships),
  };
}

function mutation(postQueryMutation, lookupPath) {
  return queryResult => {
    function mutate(arrayToMutate, lookupPathFragment, pathSoFar = []) {
      const [keyToMutate, ...restOfLookupPath] = lookupPathFragment;

      return arrayToMutate.map((value, index) => {
        if (!(keyToMutate in value)) {
          return value;
        }

        if (restOfLookupPath.length === 0) {
          // Now we can execute the mutation
          return postQueryMutation(value, keyToMutate, queryResult, [...pathSoFar, index]);
        }

        // Recurse
        return {
          ...value,
          [keyToMutate]: mutate(value[keyToMutate], restOfLookupPath, [
            ...pathSoFar,
            index,
            keyToMutate,
          ]),
        };
      });
    }

    return mutate(queryResult, lookupPath);
  };
}

const compose = fns => o => fns.reduce((acc, fn) => fn(acc), o);

function mutationBuilder(relationships, path = []) {
  return compose(
    Object.entries(relationships).map(([uid, { postQueryMutation, field, relationships }]) => {
      const uniqueField = `${uid}_${field}`;
      const postQueryMutations = mutationBuilder(relationships, [...path, uniqueField]);
      // NOTE: Order is important. We want depth first, so we perform the related mutators first.
      return postQueryMutation
        ? compose([postQueryMutations, mutation(postQueryMutation, [...path, uniqueField])])
        : postQueryMutations;
    })
  );
}

function pipelineBuilder(query) {
  const { matchTerm, postJoinPipeline, relationshipIdTerm, relationships } = query;

  const relationshipPipelines = Object.entries(relationships).map(([uid, relationship]) => {
    const { field, many, from } = relationship;
    const uniqueField = `${uid}_${field}`;
    const idsName = `${uniqueField}_id${many ? 's' : ''}`;
    const fieldSize = { $size: `$${uniqueField}` };
    return [
      {
        $lookup: {
          from,
          as: uniqueField,
          let: { [idsName]: `$${field}` },
          pipeline: pipelineBuilder({
            ...relationship,
            // The ID / list of IDs we're joining by. Do this very first so it limits any work
            // required in subsequent steps / $and's.
            relationshipIdTerm: { $expr: { [many ? '$in' : '$eq']: ['$_id', `$$${idsName}`] } },
          }),
        },
      },
      {
        $addFields: {
          [`${uniqueField}_every`]: { $eq: [fieldSize, many ? { $size: `$${field}` } : 1] },
          [`${uniqueField}_none`]: { $eq: [fieldSize, 0] },
          [`${uniqueField}_some`]: { $gt: [fieldSize, 0] },
        },
      },
    ];
  });

  return [
    relationshipIdTerm && { $match: relationshipIdTerm },
    ...flatten(relationshipPipelines),
    matchTerm && { $match: matchTerm },
    { $addFields: { id: '$_id' } },
    ...postJoinPipeline,
  ].filter(i => i);
}

module.exports = joinBuilder;
