function prettyTitle(node) {
  let pretty = node.slug
    .replace(node.navGroup.replace('@', ''), '')
    .replace(new RegExp(/(\/)/g), ' ')
    .replace('-', ' ')
    .trim();

  if (pretty.startsWith('packages') || pretty.startsWith('types')) {
    pretty = pretty.replace('packages', '').replace('types', '');
  }

  return pretty === '' ? 'index' : pretty;
}

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

  return lunrLoaded.then(({ en: lunrIndex }) => {
    const results = lunrIndex.index.search(query); // you can  customize your search , see https://lunrjs.com/guides/searching.html
    return {
      total: results.length,
      results: results
        .map(({ ref }) => {
          let node = lunrIndex.store[ref];

          return { ...node, title: prettyTitle(node) };
        })
        // Make sure `tutorials` are always first
        .sort((a, b) => (a.navGroup !== b.navGroup && a.navGroup === 'tutorials' ? -1 : 0))
        .slice(0, options.limit),
    };
  });
}
