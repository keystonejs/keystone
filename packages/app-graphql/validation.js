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

const fieldLimit = maxFields => validationContext => {
  const doc = validationContext.getDocument();
  let numFields = 0;
  visit(doc, {
    enter(node) {
      if (node.kind === Kind.FIELD) {
        numFields++;
      }
    },
  });
  if (numFields > maxFields) {
    validationContext.reportError(
      new Error(`Request contains ${numFields} fields (max: ${maxFields})`),
      doc
    );
  }
  return validationContext;
};

const depthLimit = maxDepth => validationContext => {
  // In a simple world, the depth would be the number of fields from root to leaf.
  // But it's slightly complicated because definitions can include fragment spreads,
  // and fragment/operation definitions can appear in any order.
  // We do a first pass extracting definitions, counting the depth from any fields,
  // and recording any fragment spreads (and the depths they occur at).
  // A second pass caculates the total depths.
  const doc = validationContext.getDocument();
  const nodeName = node => (node.name && node.name.value) || 'query';
  const defs = {};
  const newDef = (name, node) => {
    return (defs[name] = {
      node,
      fieldDepth: 0,
      fragments: [],
      totalDepth: null, // Calculated in second pass
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

  // Calculate the total depth
  // I.e., total from explicit fields and from fragment interpolations
  const getTotalDepth = def => {
    // This is for catching infinite loops caused by fragments mutually including each other.
    // We temporarily set the totalDepth to undefined while calculating, and if we hit that value again, we're in a loop.
    if (def.totalDepth === undefined) {
      def.totalDepth = Infinity;
      return def.totalDepth;
    }
    if (def.totalDepth !== null) return def.totalDepth;
    def.totalDepth = undefined;

    const fragmentDepths = def.fragments.map(({ atDepth, name }) => {
      if (!defs[name]) {
        validationContext.reportError(new Error(`Undefined fragment "${name}"`), def.node);
        return 0;
      }
      return atDepth + getTotalDepth(defs[name]);
    });
    def.totalDepth = Math.max(def.fieldDepth, Math.max.apply(null, fragmentDepths));
    return def.totalDepth;
  };

  for (let def of Object.values(defs)) {
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
