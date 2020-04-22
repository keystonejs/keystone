/* Inspired by https://github.com/philschatz/react-octicons */

const octicons = require('@primer/octicons');
const toPascalCase = require('to-pascal-case');
const { emptyDirSync, outputFileSync } = require('fs-extra');
const path = require('path');

const template = require('./template');

const getComponentName = iconName => `${iconName}Icon`;
const iconsIndex = [];

const EXCLUDE = ['logo-gist', 'logo-github'];

const iconPath = path.join(__dirname, '..', 'icons');

emptyDirSync(iconPath);

Object.getOwnPropertyNames(octicons).forEach(octiconName => {
  if (EXCLUDE.includes(octiconName)) return;

  let {
    options: { width, height, viewBox },
    path: svgContents,
  } = octicons[octiconName];

  const iconName = toPascalCase(octiconName);
  const componentName = getComponentName(iconName);

  iconsIndex.push({ iconName, componentName });

  svgContents = svgContents.replace(/([fill|clip])-rule="/g, '$1Rule="');

  // FIXME: we don't really want to do this here, but prettier >= 1.18 won't close empty tags anymore...
  svgContents = svgContents.replace(/><\/path>/g, ' />');

  const componentSrc = template({
    componentName,
    width,
    height,
    viewBox,
    svgContents,
  });

  outputFileSync(path.join(iconPath, `${iconName}.js`), componentSrc);
});

const iconsIndexSrc = iconsIndex
  .map(
    ({ iconName, componentName }) =>
      `export { default as ${componentName} } from './icons/${iconName}';`
  )
  .join('\n');

outputFileSync(path.join(__dirname, '..', 'index.js'), iconsIndexSrc);
