const cfonts = require('cfonts');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

/**
 * Getting all files from a directory
 *
 * @param  {string} iconPath - The path to the folder
 *
 * @return {array}           - an array of all files inside a folder with the ".js" extension stripped
 */
function getIcons(iconPath) {
	const icons = fs
		.readdirSync(path.normalize(`${process.cwd()}/${iconPath}`))
		.map(item => item.replace('.js', ''));

	console.info(chalk.green('✅ Got all icons successfully'));

	return icons;
}

/**
 * Insert an array of icons into a js export file
 *
 * @param  {array}  icons     - An array of icons
 * @param  {string} indexPath - The path to the export file
 */
function insertIndex(icons, indexPath) {
	const index = icons.map(icon => `export { ${icon} } from './icons/${icon}';`).join('\n') + '\n';

	try {
		fs.writeFileSync(path.normalize(`${process.cwd()}/${indexPath}`), index, { encoding: 'utf8' });
	} catch (error) {
		console.error(chalk.red(`❌ ${error}`));
		process.exit(1);
	}

	console.info(chalk.green('✅ Index file written successfully'));
}

/**
 * Write a package.json file
 *
 * @param  {string} pkgPath - The path to the package.json
 * @param  {object} content - The content of the package.json as an object
 *
 * @return {boolean}        - True or false
 */
function writePkg(pkgPath, content) {
	try {
		fs.writeFileSync(pkgPath, JSON.stringify(content, null, '\t') + '\n', { encoding: 'utf8' });
	} catch (error) {
		console.error(chalk.red(`❌ ${error}`));
		process.exit(1);
	}

	return true;
}

/**
 * Insert an array of icons into the preconstruct entrypoint array of a package.json
 *
 * @param  {array}  icons   - An array of icons
 * @param  {string} pkgPath - The path to the package.json file
 */
function insertPkg(icons, pkgPath) {
	pkgPath = path.normalize(`${process.cwd()}/${pkgPath}`);
	const pkg = require(pkgPath);

	pkg.preconstruct.entrypoints = ['.', ...icons];

	writePkg(pkgPath, pkg);

	console.info(chalk.green('✅ package.json file written successfully'));
}

/**
 * Fix the source key inside each icons package.json file
 *
 * @param  {array} icons - An array of all icons
 */
function fixSource(icons) {
	icons.map(icon => {
		const pkgPath = path.normalize(`${process.cwd()}/${icon}/package.json`);
		const pkg = require(pkgPath);

		if (!pkg.preconstruct) {
			pkg.preconstruct = {};
		}
		pkg.preconstruct.source = `../src/icons/${icon}`;

		writePkg(pkgPath, pkg);
	});

	console.info(chalk.green('✅ "source" inside all package.json files written successfully'));
}

/**
 * Only run this with flags so we can test the functions above
 */
if (process.argv.includes('export')) {
	cfonts.say('Building icon exports', {
		font: 'chrome',
		colors: ['red', 'green', 'white'],
	});

	const icons = getIcons('./src/icons/');
	insertIndex(icons, 'src/index.js');
	insertPkg(icons, 'package.json');
	fixSource(icons);

	console.info();
}
