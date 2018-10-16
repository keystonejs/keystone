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
    matchTerm?: Object,
    postJoinPipeline?: [ Object ],
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
  const { pipeline, mutators } = constructJoin(query);

  const mutator = objToMutate => {
    return mutators.reduce((mutationTarget, relationshipMutator) => {
      return relationshipMutator(mutationTarget);
    }, objToMutate);
  };

  return { pipeline, mutator };
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
  const pipeline = [];
  const { matchTerm, postJoinPipeline, relationships } = query;

  const mutators = [];

  if (relationships) {
    Object.entries(relationships).forEach(([uid, relationship]) => {
      // eslint-disable-next-line no-shadow
      const { matchTerm, postJoinPipeline, relationships, ...meta } = relationship;

      const uniqueField = uniqueFieldName(uid, meta.field);

      const relationPath = path.concat([uniqueField]);

      const relationJoin = constructJoin(
        { matchTerm, postJoinPipeline, relationships },
        { ...meta, uid },
        relationPath
      );

      pipeline.push({
        $lookup: {
          from: meta.from,
          as: uniqueField,
          let: {
            [idsVariableName(uid, meta.field, meta.many)]: `$${meta.field}`,
          },
          pipeline: relationJoin.pipeline,
        },
      });

      const everyCondition = {
        $eq: [{ $size: `$${uniqueField}` }, meta.many ? { $size: `$${meta.field}` } : 1],
      };

      const noneCondition = { $eq: [{ $size: `$${uniqueField}` }, 0] };

      const someCondition = { $gt: [{ $size: `$${uniqueField}` }, 0] };

      pipeline.push({
        $addFields: {
          [`${uniqueField}_every`]: everyCondition,
          [`${uniqueField}_none`]: noneCondition,
          [`${uniqueField}_some`]: someCondition,
        },
      });

      // NOTE: Order is important. We want depth first, so we push the related
      // mutators first.
      mutators.push(...relationJoin.mutators, mutation(meta.postQueryMutation, relationPath));
    });
  }
  const matchTerms = [matchTerm];

  if (relationshipMeta) {
    const { uid, field, many } = relationshipMeta;

    if (uid && field) {
      matchTerms.unshift(
        // The ID / list of IDs we're joining by. Do this very first so it
        // limits any work required in subsequent steps / $and's.
        { $expr: { [many ? '$in' : '$eq']: ['$_id', `$$${idsVariableName(uid, field, many)}`] } }
      );
    }
  }

  pipeline.push(combineMatchTerms(matchTerms.filter(i => i)));

  pipeline.push({
    $addFields: {
      id: '$_id',
    },
  });

  if (postJoinPipeline && postJoinPipeline.length) {
    pipeline.push(...postJoinPipeline);
  }

  return { pipeline: pipeline.filter(i => i), mutators };
}

const combineMatchTerms = terms =>
  terms && terms.length
    ? terms.length === 1
      ? { $match: terms[0] }
      : { $match: { $and: terms } }
    : undefined;

module.exports = joinBuilder;
