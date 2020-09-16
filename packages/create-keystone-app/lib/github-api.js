const got = require('got');
const stream = require('stream');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);

let cachedLatestVersionCommit;

const getLatestVersionCommit = async () => {
  if (cachedLatestVersionCommit === undefined) {
    let commits = await got
      .get('https://api.github.com/repos/keystonejs/keystone/commits?path=.github/release-count')
      .json();
    if (!commits.length) {
      throw new Error(
        'No commits that release keystone were found. Try updating create-keystone-app and if this problem persists, please open an issue on GitHub.'
      );
    }
    cachedLatestVersionCommit = commits[0].sha;
  }
  return cachedLatestVersionCommit;
};

const writeDirectoryFromGitHubToFs = async (from, to) => {
  const latestVersionCommit = await getLatestVersionCommit();
  const { tree } = await got(
    `https://api.github.com/repos/keystonejs/keystone/git/trees/${latestVersionCommit}?recursive=1`
  ).json();
  await Promise.all(
    tree.map(async item => {
      if (item.type === 'blob' && item.path.startsWith(from)) {
        let pathToWrite = path.join(to, item.path.replace(from, ''));
        await fs.ensureDir(path.dirname(pathToWrite));
        await pipeline(
          got.stream(
            `https://raw.githubusercontent.com/keystonejs/keystone/${latestVersionCommit}/${item.path}`
          ),
          fs.createWriteStream(pathToWrite)
        );
      }
    })
  );
};

const getExampleProjects = async () => {
  let latestVersionCommit = await getLatestVersionCommit();
  try {
    let { body: rawConfig } = await got.get(
      `https://raw.githubusercontent.com/keystonejs/keystone/${latestVersionCommit}/packages/create-keystone-app/example-projects/examples.json`
    );
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(rawConfig);
    } catch (err) {
      throw new Error(
        'The examples file from GitHub could not be parsed. Try updating create-keystone-app and if this problem persists, please open an issue on GitHub.'
      );
    }
    if (parsedConfig.version !== 1) {
      throw new Error(
        "The version of the examples file from GitHub conflicts with create-keystone-app's version. Try updating create-keystone-app and if this problem persists, please open an issue on GitHub."
      );
    }
    return parsedConfig.projects;
  } catch (err) {
    if (err instanceof got.HTTPError) {
      throw new Error(
        'The examples file from GitHub could not be found. Try updating create-keystone-app and if this problem persists, please open an issue on GitHub.'
      );
    }
    throw err;
  }
};

module.exports = { getExampleProjects, writeDirectoryFromGitHubToFs };
