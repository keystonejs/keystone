const fs = require('fs');

const getPackagesFromFileSystem = () =>
	fs
		.readdirSync('../components')
		// ToDo: Maybe warn if folder could not load?
		.filter(file => fs.existsSync(`../components/${file}/package.json`))
		.map(file => {
			const pkg = require(`../components/${file}/package.json`);
			return pkg;
		});

const getPackagesFromRemote = () => {
	// This is stubbed out for later
	return getPackagesFromFileSystem();
};

// Anything I rip from package becomes a required key. Sticking to standard npm keys.
const formatPackageData = pkgData =>
	pkgData.map(pkg => {
		const { name, version, description, author } = pkg;
		const cleanName = name.split('/').reverse()[0];
		return { packageName: name, name: cleanName, version, description, author };
	});

const resolveComponents = async () => {
	// If in dev get packages from file system otherwise get packages from npm
	const isDev = process.env.NODE_ENV !== 'production';
	const rawPackageData = isDev ? getPackagesFromFileSystem() : getPackagesFromRemote();
	return formatPackageData(rawPackageData);
};

module.exports = {
	extendKeystoneGraphQLSchema: keystone =>
		keystone.extendGraphQLSchema({
			types: [
				{
					type: `type Component { packageName:String, name:String, version:String, description:String, author:String }`,
				},
			],
			queries: [
				{
					schema: `allComponents: [Component]`,
					resolver: resolveComponents,
				},
			],
		}),
};
