exports.composeResolveInput = (originalHook, newHook) => async params => {
  let resolvedData = {};
  if (originalHook) {
    resolvedData = await originalHook(params);
  }
  return newHook({ ...params, resolvedData });
};
