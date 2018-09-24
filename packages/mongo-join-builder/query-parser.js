const cuid = require('cuid');
const { getType } = require('@voussoir/utils');

function isRelationshipType(value) {
  return getType(value) === 'Object';
}

function isANDQuery(value) {
  return getType(value) === 'Object' && Object.keys(value).includes('AND');
}

function cleanPipeline(pipeline) {
  let cleaned = pipeline.filter(pipe => pipe);

  // If it's 0 or 1 items, we can use it as-is. Any more needs an $and
  if (cleaned.length > 1) {
    cleaned = [
      {
        $and: cleaned,
      },
    ];
  }

  return cleaned;
}

module.exports = options => {
  if (!options || !options.tokenizer || getType(options.tokenizer) !== 'Object') {
    throw new Error('Must supply a `tokenizer` object');
  }

  options.getUID = options.getUID || (() => cuid());

  function parseAND(query, pathSoFar) {
    let pipeline = [];
    let postJoinPipeline = [];
    let relationships = {};

    query.AND.forEach((ANDValue, index) => {
      const type = getType(ANDValue);
      const path = [...pathSoFar, 'AND', index];
      if (type !== 'Object') {
        throw new Error(
          `Expected an Object for an AND condition, got ${type} at path ${path.join('.')}`
        );
      }
      const parsedAND = parser(ANDValue, path);

      relationships = {
        ...relationships,
        ...parsedAND.relationships,
      };

      pipeline = pipeline.concat(parsedAND.pipeline);
      postJoinPipeline = postJoinPipeline.concat(parsedAND.postJoinPipeline);
    });

    return {
      pipeline: cleanPipeline(pipeline),
      postJoinPipeline: postJoinPipeline.filter(pipe => pipe),
      relationships,
    };
  }

  function parser(query, pathSoFar = []) {
    const isAND = isANDQuery(query);
    const queryKeys = Object.keys(query);

    let pipeline = [];
    let postJoinPipeline = [];
    let relationships = {};

    if (isAND) {
      const parsedAnd = parseAND(query, pathSoFar);
      pipeline = parsedAnd.pipeline;
      postJoinPipeline = parsedAnd.postJoinPipeline;
      relationships = parsedAnd.relationships;

      // remove the `AND` query from further processing
      queryKeys.splice(queryKeys.indexOf('AND'), 1);
    }

    queryKeys.forEach(key => {
      const value = query[key];
      const isRelationship = isRelationshipType(value);

      const path = [...pathSoFar, key];

      const args = [query, key, path];

      const uid = options.getUID(key, value, path);

      if (isRelationship) {
        args.push(uid);
      }

      const queryAst = options.tokenizer[isRelationship ? 'relationship' : 'simple'].apply(
        null,
        args
      );

      const astType = getType(queryAst);
      if (
        (isRelationship && astType !== 'Object') ||
        (!isRelationship && !['Object', 'Array'].includes(astType))
      ) {
        throw new Error(
          `Must return an Object from 'tokenizer.${
            isRelationship ? 'relationship' : 'simple'
          }' function, given ${path.join('.')}`
        );
      }

      if (isRelationship) {
        const related = parser(value, path);
        relationships[uid] = {
          ...queryAst,
          ...related,
        };
      } else {
        if (Array.isArray(queryAst)) {
          pipeline.push(...queryAst);
        } else {
          if (queryAst.pipeline) {
            pipeline.push(...queryAst.pipeline);
          }

          if (queryAst.postJoinPipeline) {
            postJoinPipeline.push(...queryAst.postJoinPipeline);
          }
        }
      }
    });

    return {
      pipeline: cleanPipeline(pipeline),
      postJoinPipeline: postJoinPipeline.filter(pipe => pipe),
      relationships,
    };
  }

  return parser;
};
