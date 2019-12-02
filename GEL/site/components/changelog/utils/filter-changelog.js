import * as semver from 'semver';

const filterChangelog = (rawLogs, range) => {
	return range ? rawLogs.filter(e => semver.satisfies(e.version, range)) : rawLogs;
};

export default filterChangelog;
