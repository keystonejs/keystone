/*
function mySessionStrategy(options: Parameters<typeof statelessSessions>[0]) {
  const strategy = statelessSessions(options);
  const wrapped: typeof strategy = {
    ...strategy,
    async start ({ res, createContext }) {
      console.log('foo');
      return strategy.start({ res, data: undefined, createContext });
    }
  };

  return wrapped;
}
*/
