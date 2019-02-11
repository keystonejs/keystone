/* Inspired by https://github.com/philschatz/react-octicons */

const octicons = require('octicons');
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

  svgContents = svgContents.replace(/fill-rule="/g, 'fillRule="');

  const componentSrc = template({
    componentName,
    width,
    height,
    viewBox,
    svgContents,
  });

  outputFileSync(path.join(iconPath, `${iconName}.js`), componentSrc);
});

const iconsIndexSrc =
  '// @flow\n' +
  iconsIndex
    .map(
      ({ iconName, componentName }) =>
        `export { default as ${componentName} } from './icons/${iconName}';`
    )
    .join('\n');

outputFileSync(path.join(__dirname, '..', 'index.js'), iconsIndexSrc);
