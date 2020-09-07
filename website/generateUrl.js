const slugify = require('@sindresorhus/slugify');
const INDEX_FILES = ['index', 'readme'];

const slugifyPath = pathToSlugify => pathToSlugify.split('/').map(slugify).join('/');

// TODO: Seems like there is a bug here. Adding the parent.sourceInstanceName makes the assumption that the link is to a document in the same section. Also does not take into consideration setting the slug in markdown files... Generally I think this might be a very fragile approach and would rather use absolute URLs
module.exports = parent =>
  [
    `/${slugifyPath(parent.sourceInstanceName)}`,
    parent.relativeDirectory ? `/${slugifyPath(parent.relativeDirectory)}` : '',
    `/${INDEX_FILES.includes(parent.name.toLowerCase()) ? '' : slugifyPath(parent.name)}`,
  ].join('');
