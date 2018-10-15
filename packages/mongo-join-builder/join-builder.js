function uniqueFieldName(uid, field) {
  return `${uid}_${field}`;
}

function idsVariableName(uid, field, many) {
  return `${uniqueFieldName(uid, field)}_id${many ? 's' : ''}`;
}

/**
 * Format of input object:

  type Query {
    relationships?: { <String>: Relationship },
    pipeline?: [ Object ],
    postJoinPipeline?: [ Object ],
  }

  type Relationship: {
    from: String,
    field: String,
    match: [Object],
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
        match: [{ abc123_posts_some: { $eq: true } }],
        postQueryMutation: jest.fn(),
        many: true,

        pipeline: [
          { title: { $eq: 'hello' } },
        ],
        postJoinPipeline: [
          { $limit: 10 },
        ],
        relationships: {
          ...
        },
      },
    },
    pipeline: [
      { name: { $eq: 'foobar' } },
      { age: { $eq: 23 } },
    ],
    postJoinPipeline: [
      { $orderBy: 'name' },
    ],
  }
 */
function joinBuilder(query) {
  const { joinQuery, mutators } = constructJoin(query);

  const mutator = objToMutate => {
    return mutators.reduce((mutationTarget, relationshipMutator) => {
      return relationshipMutator(mutationTarget);
    }, objToMutate);
  };

  return { joinQuery, mutator };
}

function mutation(mutator, lookupPath) {
  if (lookupPath.length === 0 || !mutator) {
    return obj => obj;
  }

  function mutateWrapper(rootArray) {
    function mutate(arrayToMutate, lookupPathFragment, pathSoFar = []) {
      const [keyToMutate, ...restOfLookupPath] = lookupPathFragment;

      return arrayToMutate.map((value, index) => {
        if (!(keyToMutate in value)) {
          return value;
        }

        if (restOfLookupPath.length === 0) {
          // Now we can execute the mutation
          return mutator(value, keyToMutate, rootArray, [...pathSoFar, index]);
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

    return mutate(rootArray, lookupPath);
  }

  return mutateWrapper;
}

function constructJoin(query, relationshipMeta, path = []) {
  const joinQuery = [];
  const { pipeline, postJoinPipeline, relationships } = query;

  const mutators = [];

  if (relationships) {
    Object.entries(relationships).forEach(([uid, relationship]) => {
      // eslint-disable-next-line no-shadow
      const { pipeline, postJoinPipeline, relationships, ...meta } = relationship;

      const uniqueField = uniqueFieldName(uid, meta.field);

      const relationPath = path.concat([uniqueField]);

      const relationJoin = constructJoin(
        { pipeline, postJoinPipeline, relationships },
        { ...meta, uid },
        relationPath
      );

      joinQuery.push({
        $lookup: {
          from: meta.from,
          as: uniqueField,
          let: {
            [idsVariableName(uid, meta.field, meta.many)]: `$${meta.field}`,
          },
          pipeline: relationJoin.joinQuery,
        },
      });

      const everyCondition = {
        $eq: [{ $size: `$${uniqueField}` }, meta.many ? { $size: `$${meta.field}` } : 1],
      };

      const noneCondition = { $eq: [{ $size: `$${uniqueField}` }, 0] };

      const someCondition = { $gt: [{ $size: `$${uniqueField}` }, 0] };

      joinQuery.push({
        $addFields: {
          [`${uniqueField}_every`]: everyCondition,
          [`${uniqueField}_none`]: noneCondition,
          [`${uniqueField}_some`]: someCondition,
        },
      });

      // This part is our client filtering expression. This determins if the
      // parent item is included in the final list
      joinQuery.push(matchList(meta.match));

      // NOTE: Order is important. We want depth first, so we push the related
      // mutators first.
      mutators.push(...relationJoin.mutators, mutation(meta.postQueryMutation, relationPath));
    });
  }
  if (pipeline) {
    const combinedPipeline = [...pipeline];

    if (relationshipMeta) {
      const { uid, field, many } = relationshipMeta;

      if (uid && field) {
        combinedPipeline.unshift(
          // The ID / list of IDs we're joining by. Do this very first so it
          // limits any work required in subsequent steps / $and's.
          {
            $expr: {
              [many ? '$in' : '$eq']: ['$_id', `$$${idsVariableName(uid, field, many)}`],
            },
          }
        );
      }
    }

    joinQuery.push(matchList(combinedPipeline));
  }

  joinQuery.push({
    $addFields: {
      id: '$_id',
    },
  });

  if (postJoinPipeline && postJoinPipeline.length) {
    joinQuery.push(...postJoinPipeline);
  }

  return { joinQuery: joinQuery.filter(i => i), mutators };
}

const matchList = terms =>
  terms && terms.length
    ? terms.length === 1
      ? { $match: terms[0] }
      : { $match: { $and: terms } }
    : undefined;

module.exports = joinBuilder;
