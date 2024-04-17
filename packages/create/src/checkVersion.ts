import getPackageJson from 'package-json';
import currentPkgJson from '../package.json';
import * as semver from 'semver';

export async function checkVersion() {
  try {
    const { version } = await getPackageJson('create-keystone-app');
    if (typeof version !== 'string') {
      throw new Error(
        'version from package metadata was expected to be a string but was not'
      );
    }
    if (semver.lt(currentPkgJson.version, version)) {
      console.error(
        `⚠️  You're running an old version of create-keystone-app, please update to ${version}`
      );
    }
  } catch (err) {
    console.error(
      'A problem occurred fetching the latest version of create-keystone-app'
    );
    console.error(err);
  }
}
