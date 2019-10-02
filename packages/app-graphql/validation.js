const { visit, Kind } = require('graphql');

const definitionLimit = maxDefinitions => validationContext => {
  const doc = validationContext.getDocument();
  if (doc.definitions.length > maxDefinitions) {
    validationContext.reportError(
      new Error(`Request contains ${doc.definitions.length} definitions (max: ${maxDefinitions})`),
      doc
    );
  }
  return validationContext;
};

const nodeName = node => (node.name && node.name.value) || 'query';

// Map fragments referenced in a definition through a function
// Mostly here for consistent handling of invalid fragment references
const mapFragments = (validationContext, defTable, def, f) => {
  return def.fragments
    .map(fragment => {
      if (!defTable[fragment.name]) {
        validationContext.reportError(new Error(`Undefined fragment "${fragment.name}"`), def.node);
        return null;
      }
      return f(fragment);
    })
    .filter(x => x !== null);
};

// Some of these validators are a bit more complicated than they'd otherwise need to be
// because definitions can include fragment spreads, and fragment/operation definitions
// can appear in any order.  So they have to do two passes: one extracting definitions
// and tracking which definitions contain which fragment spreads.  Then a second pass
// calculates the required value.

const fieldLimit = maxFields => validationContext => {
  // The total field count includes fields that would be there after expanding fragments
  const doc = validationContext.getDocument();
  const defs = {};
  const newDef = (name, node) => {
    return (defs[name] = {
      node,
      numFields: 0,
      fragments: [],
      totalNumFields: undefined, // Calculated in second pass
    });
  };
  let curDef = newDef('doc', doc);
  visit(doc, {
    enter(node) {
      switch (node.kind) {
        case Kind.FRAGMENT_DEFINITION:
        case Kind.OPERATION_DEFINITION:
          curDef = newDef(nodeName(node), node);
          break;

        case Kind.FIELD:
          curDef.numFields++;
          break;

        case Kind.FRAGMENT_SPREAD:
          curDef.fragments.push({
            name: nodeName(node),
          });
          break;
      }
    },
  });

  const getTotalNumFields = def => {
    // Memoise results guard against infinite loops using null as sentinel
    if (def.totalNumFields === null) {
      // Mutually included fragments have infinite count
      // (Not legal but we need to guard against it)
      def.totalNumFields = Infinity;
      return def.totalNumFields;
    }
    if (def.totalNumFields !== undefined) return def.totalNumFields;
    def.totalNumFields = null;

    const fragmentNumFields = mapFragments(validationContext, defs, def, ({ name }) =>
      getTotalNumFields(defs[name])
    );
    def.totalNumFields = fragmentNumFields.reduce((a, b) => a + b, def.numFields);
    return def.totalNumFields;
  };

  const sumNumFields = defList => {
    return defList.map(getTotalNumFields).reduce((a, b) => a + b, 0);
  };

  // Total number of fields in request is the number in (expanded) queries/mutations,
  // plus (to be safe) the number in any unused fragments that are left over.
  const numOpFields = sumNumFields(
    Object.values(defs).filter(d => d.node.kind === Kind.OPERATION_DEFINITION)
  );
  const numOtherFields = sumNumFields(
    Object.values(defs).filter(d => d.totalNumFields === undefined)
  );
  const requestNumFields = numOpFields + numOtherFields;

  if (requestNumFields > maxFields) {
    validationContext.reportError(
      new Error(`Request contains ${requestNumFields} fields (max: ${maxFields})`),
      doc
    );
  }
  return validationContext;
};

const depthLimit = maxDepth => validationContext => {
  const doc = validationContext.getDocument();
  const defs = {};
  const newDef = (name, node) => {
    return (defs[name] = {
      node,
      fieldDepth: 0,
      fragments: [],
      totalDepth: undefined, // Calculated in second pass
    });
  };

  let curDef = newDef('doc', doc);
  let visitorDepth = 0;
  visit(doc, {
    enter(node) {
      switch (node.kind) {
        case Kind.FRAGMENT_DEFINITION:
        case Kind.OPERATION_DEFINITION:
          curDef = newDef(nodeName(node), node);
          break;

        case Kind.FIELD:
          visitorDepth++;
          curDef.fieldDepth = Math.max(curDef.fieldDepth, visitorDepth);
          break;

        case Kind.FRAGMENT_SPREAD:
          // The depth at which the spread occurs is tracked so we can calculate the total depth after expansion
          curDef.fragments.push({
            name: nodeName(node),
            atDepth: visitorDepth,
          });
          break;
      }
    },
    leave(node) {
      if (node.kind === Kind.FIELD) {
        visitorDepth--;
      }
    },
  });

  // Total depth from explicit fields and from fragment interpolations
  const getTotalDepth = def => {
    // Memoise results guard against infinite loops using null as sentinel
    if (def.totalDepth === null) {
      // Mutually included fragments have infinite depth
      // (Not legal but we need to guard against it)
      def.totalDepth = Infinity;
      return def.totalDepth;
    }
    if (def.totalDepth !== undefined) return def.totalDepth;
    def.totalDepth = null;

    const fragmentDepths = mapFragments(
      validationContext,
      defs,
      def,
      ({ name, atDepth }) => atDepth + getTotalDepth(defs[name])
    );
    def.totalDepth = Math.max(def.fieldDepth, Math.max.apply(null, fragmentDepths));
    return def.totalDepth;
  };

  for (const def of Object.values(defs)) {
    const totalDepth = getTotalDepth(def);
    if (totalDepth > maxDepth) {
      validationContext.reportError(
        new Error(`Operation has depth ${totalDepth} (max: ${maxDepth})`),
        def.node
      );
    }
  }
  return validationContext;
};

module.exports = {
  depthLimit,
  fieldLimit,
  definitionLimit,
};
