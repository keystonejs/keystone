function prettyTitle(node) {
  let pretty = node.slug
    .replace(node.workspace.replace('@', ''), '')
    .replace(new RegExp(/(\/)/g), ' ')
    .replace('-', ' ')
    .trim();

  if (pretty.startsWith('packages') || pretty.startsWith('types')) {
    pretty = pretty.replace('packages', '').replace('types', '');
  }

  return pretty === '' ? 'index' : pretty;
}

export function getResults(query) {
  if (!query || !window.__LUNR__) return [];
  const lunrIndex = window.__LUNR__['en'];
  const results = lunrIndex.index.search(query); // you can  customize your search , see https://lunrjs.com/guides/searching.html
  return (
    results
      .map(({ ref }) => {
        let node = lunrIndex.store[ref];

        return { ...node, title: prettyTitle(node) };
      })
      // Make sure `tutorials` are always first
      .sort((a, b) => (a.workspace !== b.workspace && a.workspace === 'tutorials' ? -1 : 0))
  );
  return results;
}
