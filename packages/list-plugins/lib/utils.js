exports.composeHook = (originalHook, newHook) => async params => {
  let { resolvedData } = params;
  if (originalHook) {
    resolvedData = await originalHook(params);
  }
  return newHook({ ...params, resolvedData });
};

exports.composeAccess = (originalAccess, newAccess = {}) => {
  if (typeof originalAccess === 'undefined') {
    return {
      ...newAccess,
    };
  }

  const isShorthand = typeof originalAccess === 'boolean';
  if (isShorthand) {
    return {
      create: originalAccess,
      read: originalAccess,
      update: originalAccess,
      delete: originalAccess,
      auth: originalAccess,
      ...newAccess,
    };
  }
  return {
    ...originalAccess,
    ...newAccess,
  };
};
