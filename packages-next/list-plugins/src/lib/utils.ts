export const composeHook = (originalHook: any, newHook: any) => async (params: any) => {
  let { resolvedData } = params;
  if (originalHook) {
    resolvedData = await originalHook(params);
  }
  return newHook({ ...params, resolvedData });
};

export const composeAccess = (originalAccess: any, newAccess = {}) => {
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
