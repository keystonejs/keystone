const { spawnSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
//  eslint-disable-next-line import/no-extraneous-dependencies
const { default: getReleasePlan } = require('@changesets/get-release-plan');
//  eslint-disable-next-line import/no-extraneous-dependencies
const { getInfo } = require('@changesets/get-github-info');

// TODO: move this to CI linting
const verbs = new Set(['Adds', 'Changes', 'Fixes', 'Moves', 'Removes', 'Updates', 'Upgrade']);

// TODO: derived?
const publicPackages = [
  '@keystone-6/auth',
  '@keystone-6/cloudinary',
  '@keystone-6/core',
  '@keystone-6/document-renderer',
  '@keystone-6/fields-document',
  '@keystone-6/session-store-redis',
];

const cves = [
  //    {
  //      id: 'CVE-2022-NNNN',
  //      href: 'https://github.com/keystonejs/keystone/security/advisories/GHSA-...',
  //      upstream: true,
  //      description: `
  //        An upstream transitive dependency \`XXX\` is vulnerable to ZZZZZZ.
  //        We have upgraded to a version of \`YYY\` package to a version that doesn't use \`XXX\`.
  //      `
  //    }
];

function gitCommitsSince(tag) {
  const { stdout } = spawnSync('git', ['rev-list', `^${tag}`, 'HEAD']);
  return stdout
    .toString('utf-8')
    .split('\n')
    .filter(x => x);
}

function firstGitCommitOf(path) {
  const { stdout } = spawnSync('git', [
    'rev-list',
    '--date-order',
    '--reverse',
    'HEAD',
    '--',
    path,
  ]);
  return stdout
    .toString('utf-8')
    .split(' ', 1)
    .pop()
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 40);
}

function gitCommitDescription(commit) {
  const { stdout } = spawnSync('git', ['log', '--oneline', commit]);
  return stdout.toString('utf-8').split('\n', 1).pop().slice(10);
}

async function fetchData(tag) {
  const { changesets, releases } = await getReleasePlan('.');

  // find the commits since the tag
  const revs = gitCommitsSince(tag);
  console.error(`${revs.length} commits since ${tag}`);
  if (revs.length === 0) throw new Error('No commits');
  if (revs.length > 200) throw new Error('Too many commits');

  // tag changesets with their commits
  for (const changeset of changesets) {
    const commit = firstGitCommitOf(`.changeset/${changeset.id}.md`);

    if (!revs.includes(commit)) throw new Error(`Unexpected commit ${changeset.commit}`);
    console.error(`commit ${commit} found for changeset ${changeset.id}`);
    changeset.commit = commit;
  }

  // list all the contributors
  const previousContributors = JSON.parse(
    readFileSync('.changeset/contributors.json').toString('utf-8')
  );
  const changes = {};
  for (const commit of revs) {
    let { user, pull } = await getInfo({ repo: 'keystonejs/keystone', commit });
    pull = pull || gitCommitDescription(commit).match(/#([0-9]+)/)?.[1];

    console.error(`commit ${commit}, user ${user}, pull #${pull}`);
    const change = { commit, user, pull };
    changes[commit] = change;

    if (previousContributors.includes(user)) continue;
    change.first = true;
  }

  // join some of the changeset data with the commit information
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

    const change = changes[commit];
    change.changeset = changeset.id;
    change.summary = summary;
    change.type = type;

    // only public packages, then strip the namespace
    change.packages = releases
      .filter(x => publicPackages.includes(x.name))
      .map(x => x.name.replace('@keystone-6/', ''))
      .sort();
  }

  // tally contributions
  const contributors = [
    ...new Set([...previousContributors, ...Object.values(changes).map(x => x.user)]),
  ];

  // only public packages
  const packages = releases
    .filter(x => publicPackages.includes(x.name))
    .filter(x => x.type !== 'none')
    .map(x => `${x.name}@${x.newVersion}`)
    .sort();

  return { packages, changes: Object.values(changes), contributors };
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

function formatCVE({ id, href, upstream, description }) {
  description = description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return `- [\`${id}\`](${href}) - ${description}`;
}

function link(pull) {
  return `[#${pull}](https://github.com/keystonejs/keystone/pull/${pull})`;
}

function groupPullsByUser(list) {
  const result = {};
  for (const item of list) {
    if (!item.pull) continue;
    result[item.user] ||= [];
    result[item.user].push(item.pull);
  }
  return Object.entries(result).map(([user, pulls]) => ({ user, pulls }));
}

async function generateGitHubReleaseText(previousTag) {
  if (!previousTag) throw new Error('Missing tag');

  const date = new Date().toISOString().slice(0, 10).replace(/\-/g, '_');
  const { packages, changes, contributors } = await fetchData(previousTag);
  //    writeFileSync(`./CHANGELOG-${date}.json`, JSON.stringify({ packages, changes, contributors }, null, 2))
  //    return process.exit(0)
  //    const { packages, changes, contributors } = JSON.parse(readFileSync(`./CHANGELOG-${date}.json`))

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

  if (cves.length) {
    output.push(
      ...[
        `#### :rotating_light: Security Updates`,
        `We have identified and fixed ${cves.length}${
          cves.some(x => x.upstream) ? ' upstream' : ''
        } security vulnerabilities`,
        ...cves.map(formatCVE),
        ``,
      ]
    );
  }

  const first = changes.filter(x => x.first);
  const unattributed = changes.filter(x => !x.type && !x.first);

  if (first.length || unattributed.length) {
    const listf = groupPullsByUser(first);

    output.push(`#### :seedling: New Contributors`);
    output.push(
      `Thanks to the following developers for making their first contributions to the project!`
    );
    output.push(...listf.map(({ user, pulls }) => `- @${user} (${pulls.map(link).join(',')})`));
    output.push(``);
  }

  if (unattributed.length) {
    const listu = groupPullsByUser(unattributed);

    output.push(`#### :blue_heart: Acknowledgements `);
    output.push(
      `Lastly, thanks to ${listu
        .map(({ user, pulls }) => `@${user} (${pulls.map(link).join(',')})`)
        .join(', ')} for changes not shown above, but none-the-less appreciated.`
    );
    output.push(``);
  }

  writeFileSync('./.changeset/contributors.json', JSON.stringify(contributors.sort(), null, 2));
  writeFileSync(`./CHANGELOG-${date}.md`, output.join('\n'));
  console.error('files written');
}

generateGitHubReleaseText(process.argv[2]);
