/* Inspired by https://github.com/philschatz/react-octicons */

const octicons = require('octicons');
const toPascalCase = require('to-pascal-case');
const { emptyDirSync, outputFileSync } = require('fs-extra');

const template = require('./template');

const getComponentName = iconName => `${iconName}Icon`;
const iconsIndex = [];

const EXCLUDE = ['logo-gist', 'logo-github'];

emptyDirSync('./icons');

Object.getOwnPropertyNames(octicons).forEach(octiconName => {
  if (EXCLUDE.includes(octiconName)) return;

  let {
    options: { width, height, viewBox, 'aria-hidden': ariaHidden },
    path: svgContents,
  } = octicons[octiconName];

  const iconName = toPascalCase(octiconName);
  const componentName = getComponentName(iconName);

  iconsIndex.push({ iconName, componentName });

  svgContents = svgContents.replace(/fill-rule="/g, 'fillRule="');

  const componentSrc = template({
    componentName,
    width,
    height,
    viewBox,
    ariaHidden,
    svgContents,
  });

  outputFileSync(`./icons/${iconName}.js`, componentSrc);
});

const iconsIndexSrc = iconsIndex
  .map(
    ({ iconName, componentName }) =>
      `export { default as ${componentName} } from './icons/${iconName}';`
  )
  .join('\n');

outputFileSync('./index.js', iconsIndexSrc);
