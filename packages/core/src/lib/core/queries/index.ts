import { getGqlNames } from '../../../types';
import { graphql } from '../../..';
import { InitialisedModel } from '../types-for-lists';
import * as queries from './resolvers';

export function getQueriesForModel(model: InitialisedModel) {
  if (!model.graphql.isEnabled.query) return {};
  const names = getGqlNames(model);

  const findOne = graphql.field({
    type: model.types.output,
    args: { where: graphql.arg({ type: graphql.nonNull(model.types.uniqueWhere) }) },
    async resolve(_rootVal, args, context) {
      return queries.findOne(args, model, context);
    },
  });

  const findMany = graphql.field({
    type: graphql.list(graphql.nonNull(model.types.output)),
    args: model.types.findManyArgs,
    async resolve(_rootVal, args, context, info) {
      return queries.findMany(args, model, context, info);
    },
  });

  const countQuery = graphql.field({
    type: graphql.Int,
    args: {
      where: graphql.arg({ type: graphql.nonNull(model.types.where), defaultValue: {} }),
    },
    async resolve(_rootVal, args, context, info) {
      return queries.count(args, model, context, info);
    },
  });

  return {
    [names.listQueryName]: findMany,
    [names.itemQueryName]: findOne,
    [names.listQueryCountName]: countQuery,
  };
}
