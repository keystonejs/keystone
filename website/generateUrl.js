const slugify = require('@sindresorhus/slugify');
const INDEX_FILES = ['index', 'readme'];

const slugifyPath = pathToSlugify =>
  pathToSlugify
    .split('/')
    .map(slugify)
    .join('/');

module.exports = parent =>
  [
    `/${slugifyPath(parent.sourceInstanceName)}`,
    parent.relativeDirectory ? `/${slugifyPath(parent.relativeDirectory)}` : '',
    `/${INDEX_FILES.includes(parent.name.toLowerCase()) ? '' : slugifyPath(parent.name)}`,
  ].join('');
