const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const tmp = require('tmp');
const fs = require('fs');

const slugFromFilename = filename => {
	if (filename.match(/^[0-9][0-9]-/)) {
		return filename.slice(3, -3);
	} else {
		return filename;
	}
};

const labelFromSlug = slug => {
	return slug.replace(/-/g, ' ').replace(slug[0], slug[0].toUpperCase());
};

const { PACKAGE_NAME } = process.env;

const findExampleFiles = package => {
	const exampleFolder = path.resolve(`${__dirname}/../../components/${package}/examples`);

	if (fs.existsSync(exampleFolder)) {
		const files = fs
			.readdirSync(exampleFolder)
			.filter(file => !file.startsWith('.') && !file.startsWith('_') && file.endsWith('.js'));

		return files.map(filename => {
			const slug = slugFromFilename(filename);
			const label = labelFromSlug(slug);

			return {
				filename,
				slug,
				label,
				relativePath: path.relative(__dirname, `${exampleFolder}/${filename}`),
				absolutePath: `${exampleFolder}/${filename}`,
				path: exampleFolder,
			};
		});

		return files;
	} else {
		console.error(`Package doesn't exist: ${exampleFolder}`);
	}
};

tmp.setGracefulCleanup();
const tmpObj = tmp.fileSync();

fs.writeSync(
	tmpObj.fd,
	`
	import app from '${__dirname}/index';

	const components = [
		${findExampleFiles(PACKAGE_NAME)
			.map(
				example => `
			{
				${Object.entries(example)
					.map(
						([key, value]) => `
					"${key}": ${JSON.stringify(value)}
				`
					)
					.join(',\n')},
				Module: require('${example.absolutePath}'),
			}
		`
			)
			.join(',\n')}
	];

	app("${labelFromSlug(PACKAGE_NAME)}", "${PACKAGE_NAME}", components);
`
);

process.on('exit', () => {
	tmpObj.removeCallback();
});

module.exports = () => ({
	entry: tmpObj.name,
	context: path.normalize(`${__dirname}/../../components/${PACKAGE_NAME}/`),
	mode: 'development',

	output: {
		filename: '[name]-[hash].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					rootMode: 'upward',
				},
			},
		],
	},

	plugins: [
		new HtmlWebpackPlugin(),
		new HtmlWebpackRootPlugin(),
		new CopyPlugin([
			{
				from: '*',
				to: 'assets/',
				context: path.normalize(`${__dirname}/../../components/${PACKAGE_NAME}/examples/assets/`),
			},
		]),
	],
	devServer: {
		historyApiFallback: true,
		port: 8080,
	},
});
