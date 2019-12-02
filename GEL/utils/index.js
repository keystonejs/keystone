const fs = require('fs');
const path = require('path');

module.exports = dir => {
	const files = fs.readdirSync(path.join(dir, 'snippets'));
	return files
		.map(x => {
			const { name } = path.parse(x);
			// hmmmmmm 😅
			const shortName = name.split('__')[1];
			return `
      import * as ${shortName} from './snippets/${x}';
      export {${shortName}};
    `;
		})
		.join('\n');
};
