let lunrLoaded;

export function getResults(query, options = { limit: Infinity }) {
  if (!query) {
    return Promise.resolve({ results: [], length: 0 });
  }

  // Wait until lunr is loaded.
  // See https://github.com/humanseelabs/gatsby-plugin-lunr/issues/11
  if (!lunrLoaded) {
    lunrLoaded = new Promise((resolve, reject) => {
      if (window.__LUNR__) {
        return resolve(window.__LUNR__);
      }
      const interval = window.setInterval(() => {
        if (window.__LUNR__) {
          window.clearInterval(interval);
          window.clearTimeout(timeout);
          return resolve(window.__LUNR__);
        }
      }, 200);

      const timeout = window.setTimeout(() => {
        window.clearInterval(interval);
        reject('Unable to load search index');
      }, 5000);
    });
  }

  // NOTE: documentation of syntax for customizing search can be found:
  // https://lunrjs.com/guides/searching.html
  return lunrLoaded.then(({ en: lunrIndex }) => {
    // find matches that *begin* with the query ("perf" will match "performance")
    let results = lunrIndex.index.search(`${query}*`);

    // when no matches are found, try again, but allow results that are off by
    // one ("accrss contrll" will match "access control")
    if (!results.length) {
      results = lunrIndex.index.search(`${query}~1`);
    }

    return {
      total: results.length,
      results: results
        .map(({ ref }) => {
          let node = lunrIndex.store[ref];
          return node;
        })
        // Make sure `tutorials` are always first
        .sort((a, b) => (a.navGroup !== b.navGroup && a.navGroup === 'tutorials' ? -1 : 0))
        .slice(0, options.limit),
    };
  });
}
