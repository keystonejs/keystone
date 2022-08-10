/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');

const fs = require('fs-extra');
const { transform: svgr } = require('@svgr/core');
const { icons } = require('feather-icons');
const toPascalCase = require('to-pascal-case');
const globby = require('globby');

const chalk = require('chalk');

async function writeIcons() {
  const iconOutDir = path.join(__dirname, 'src', 'icons');

  await fs.ensureDir(iconOutDir);
  let names = [];
  await Promise.all(
    Object.keys(icons).map(async key => {
      let name = `${toPascalCase(key)}Icon`;
      let code = await svgr(
        icons[key].toSvg(),
        {
          icon: true,
          typescript: true,
          template: function (variables, { tpl }) {
            return tpl`
            ${variables.imports}

            ${variables.interfaces};

            import { createIcon } from '../Icon'

            const ${variables.componentName} = createIcon(
              ${variables.jsx},
              ${name}
            );

            ${variables.exports}
            `;
          },
          plugins: [
            // '@svgr/plugin-svgo',
            '@svgr/plugin-jsx',
            '@svgr/plugin-prettier',
          ],
        },
        { componentName: name }
      );
      await fs.writeFile(path.join(iconOutDir, `${name}.tsx`), code);
      names.push(name);
    })
  );
  return names;
}

async function writeIndex(icons) {
  const index =
    `export type { IconProps } from './Icon';\n\n` +
    icons.map(icon => `export { ${icon} } from './icons/${icon}';`).join('\n') +
    `\n`;

  await fs.writeFile('src/index.tsx', index, {
    encoding: 'utf8',
  });

  console.info(chalk.green('✅ Index file written successfully'));
}

async function writePkg(pkgPath, content) {
  await fs.ensureFile(pkgPath);
  await fs.writeFile(pkgPath, JSON.stringify(content, null, 2) + '\n', {
    encoding: 'utf8',
  });
}

async function createEntrypointPkgJsons(icons) {
  await Promise.all(
    icons.map(async icon => {
      const pkgPath = path.join(process.cwd(), 'icons', icon, 'package.json');

      await writePkg(pkgPath, {
        main: 'dist/icons.cjs.js',
        module: 'dist/icons.esm.js',
      });
    })
  );

  console.info(chalk.green('✅ all package.json entrypoint files written successfully'));
}

async function clean() {
  let pathnames = await globby(['icons/*', 'src/icons/*'], {
    expandDirectories: false,
    onlyFiles: false,
  });
  await Promise.all(
    pathnames.map(async pathname => {
      await fs.remove(pathname);
    })
  );
}

(async () => {
  console.info(chalk.blue('🧹 Cleaning existing exports'));
  await clean();
  console.info(chalk.blue('🚧 Building icon exports'));

  let icons = await writeIcons();
  await Promise.all([writeIndex(icons), createEntrypointPkgJsons(icons)]);
})();
