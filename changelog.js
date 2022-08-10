const { spawnSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
//  eslint-disable-next-line import/no-extraneous-dependencies
const { default: getReleasePlan } = require('@changesets/get-release-plan');
//  eslint-disable-next-line import/no-extraneous-dependencies
const { getInfo } = require('@changesets/get-github-info');

// TODO: move this to CI linting
const verbs = new Set(['Adds', 'Changes', 'Fixes', 'Moves', 'Removes', 'Updates']);

function gitCommitsSince(tag) {
  const { stdout } = spawnSync('git', ['rev-list', `^${tag}`, 'HEAD']);
  return stdout
    .toString('utf-8')
    .split('\n')
    .filter(x => x);
}

function firstGitCommitOf(path) {
  const { stdout } = spawnSync('git', ['rev-list', 'HEAD', '--', path]);
  return stdout
    .toString('utf-8')
    .split(' ', 1)
    .pop()
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 40);
}

async function fetchData(tag) {
  const { changesets, releases } = await getReleasePlan('.');

  // find the commits since the tag
  const revs = gitCommitsSince(tag);
  console.error(`${revs.length} commits since ${tag}`);
  if (revs.length === 0) throw new Error('No commits');
  if (revs.length > 50) throw new Error('Too many commits');

  // tag changesets with their commits
  for (const changeset of changesets) {
    const commit = firstGitCommitOf(`.changeset/${changeset.id}.md`);

    if (!revs.includes(commit)) throw new Error(`Unexpected commit ${changeset.commit}`);
    changeset.commit = commit;
  }

  // list all the contributors
  const contributors = JSON.parse(readFileSync('.changeset/contributors.json').toString('utf-8'));
  const first = []; // first time contributors

  const commits = {};
  for (const commit of revs) {
    const { user, pull } = await getInfo({ repo: 'keystonejs/keystone', commit });
    console.error(`commit ${commit}, user ${user}, pull #${pull}`);
    commits[commit] = { commit, user, pull };

    if (contributors.includes(user)) continue;
    first.push({ user, pull });
    contributors.push(user);
  }

  // join some of the changeset data with the GitHub commit information
  const changes = [];
  for (const changeset of changesets) {
    const { releases, summary, commit } = changeset;

    // TODO: move this to CI linting
    const describedType = summary.split(' ')[0];
    if (!verbs.has(describedType)) {
      console.warn(`  Verb '${describedType}' is non-standard for a changeset`);
    }

    // poor semver precedence
    let type;
    for (const release of releases) {
      if (['minor', 'patch', undefined].includes(type) && release.type === 'major') type = 'major';
      if (['patch', undefined].includes(type) && release.type === 'minor') type = 'minor';
      if ([undefined].includes(type) && release.type === 'patch') type = 'patch';
    }
    if (!type) throw new Error('Unknown type');

    const { user, pull } = commits[commit];
    commits[commit].changeset = changeset;

    // only include keystone-6 packages, then strip the namespace
    const publicPackages = releases
      .filter(x => x.name.startsWith('@keystone-6'))
      .map(x => x.name.replace('@keystone-6/', ''));

    changes.push({
      packages: publicPackages,
      type,
      commit,
      summary,
      user,
      pull,
    });
  }

  // only include keystone-6 packages
  const packages = releases
    .filter(x => x.name.startsWith('@keystone-6'))
    .filter(x => x.type !== 'none')
    .map(x => `${x.name}@${x.newVersion}`);

  // unattributed contributions
  const unattributed = Object.values(commits).filter(x => !x.changeset);
  return { packages, changes, contributors, first, unattributed };
}

function formatPackagesChanged(packages) {
  return `The following packages have been updated
%%%
${packages.join('\n')}
%%%`.replace(/%/g, '`');
}

function formatChange({ packages, summary, pull, user }) {
  return `- \`[${packages.join(', ')}]\` ${summary} (#${pull}) @${user}`;
}

async function generateGitHubReleaseText(previousTag) {
  if (!previousTag) throw new Error('Missing tag');

  const { packages, changes, contributors, first, unattributed } = await fetchData(previousTag);
  const output = [];

  output.push(formatPackagesChanged(packages));
  output.push('');

  const breaking = changes.filter(x => x.type === 'major');
  const features = changes.filter(x => x.type === 'minor');
  const fixes = changes.filter(x => x.type === 'patch');

  if (breaking.length) {
    output.push(...[`#### Breaking Changes`, ...breaking.map(formatChange), ``]);
  }

  if (features.length) {
    output.push(...[`#### New Features`, ...features.map(formatChange), ``]);
  }

  if (fixes.length) {
    output.push(...[`#### Bug Fixes`, ...fixes.map(formatChange), ``]);
  }

  if (first.length || unattributed.length) {
    const listh = unattributed.map(
      ({ user, pull }) =>
        `@${user} ([#${pull}](https://github.com/keystonejs/keystone/pull/${pull}))`
    );
    const listf = first.map(
      ({ user, pull }) =>
        `@${user} ([#${pull}](https://github.com/keystonejs/keystone/pull/${pull}))`
    );

    output.push(`#### Acknowledgements :blue_heart:`);
    if (listh.length && listf.length) {
      output.push(
        `Thanks to ${listf.join(
          ', '
        )} for their first contributions to the project, and a shoutout to ${listh.join(
          ', '
        )} for their help.`
      );
    } else if (listh.length) {
      output.push(`Thanks to ${listh.join(', ')} for their contributions to the project.`);
    } else if (listf.length) {
      output.push(
        `Thanks to ${listf.join(', ')} for making their first contributions to the project!`
      );
    }

    output.push(``);
  }

  const date = new Date().toISOString().slice(0, 10);
  writeFileSync('./.changeset/contributors.json', JSON.stringify(contributors.sort(), null, 2));
  writeFileSync(`./.changeset/release-${date}.md`, output.join('\n'));
  console.error('files written to .changeset/');
}

generateGitHubReleaseText(process.argv[2]);
