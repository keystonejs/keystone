// Creates a single access rule from multiple where ALL conditions are met

const combineAccessRules = (rules, operationIsOr) => async auth => {
  // Resolve the rules by passing auth to each
  // "resolved" is now either true, false or {}
  const resolved = await Promise.all(
    rules.map(rule => {
      // Resolve functions
      if (!!(rule && rule.constructor && rule.call && rule.apply)) {
        return rule(auth);
      }
      return rule;
    })
  );

  // For AND: if every rule is true, we return true
  // For OR: if any rule is true, we return true
  const checkedRules = operationIsOr
    ? resolved.some(rule => {
        return rule === true;
      })
    : resolved.every(rule => {
        return rule === true;
      });
  // If checkedRules is "true" either:
  // - All AND rules were true
  // - Some OR rules were true
  if (checkedRules) {
    return operationIsOr;
  }

  // If checkedRules is "false" either:
  // - Some AND rules are false or {}
  // - All OR rules are false
  const graphQLWhereRules = resolved.filter(rule => typeof rule === 'object');

  // If we have where clauses, combine them and return a single where clause
  if (graphQLWhereRules.length) {
    return operationIsOr ? { OR: graphQLWhereRules } : { AND: graphQLWhereRules };
  }

  // If no where clauses, All OR rules must be false
  return false;
};

const and = (...rules) => combineAccessRules(rules, false);
const or = (...rules) => combineAccessRules(rules, true);

module.exports = { and, or };
