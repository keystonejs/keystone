// const fs = require('fs');
const path = require('path');

module.exports = dir => {
	// const files = fs.readdirSync(path.join(dir, 'snippets'));
	const files = [];

	return files
		.map(x => {
			const { name } = path.parse(x);
			// hmmmmmm 😅
			const shortName = name.split('_')[1];
			return `
      import * as ${shortName} from './snippets/${x}';
      export {${shortName}};
    `;
		})
		.join('\n');
};
