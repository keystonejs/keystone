# Contributing

Contributions to KeystoneJS in the form of issues and PRs are welcomed.

During the alpha stage of development we are focussing on getting the core systems working smoothly.
Contributions which improve the documention and test coverage are particularly welcomed.

## Code of Conduct

KeystoneJS adheres to the [Contributor Covenant Code of Conduct](code-of-conduct.md).

## Version management

Keystone uses @noviny's [@changesets/cli](https://github.com/noviny/changesets) in combination with `bolt` to track package versions and publish packages.
This tool allows each PR to indicate which packages need a version bump along with a changelog snippet.
This information is then collated when performing a release to update package versions and `CHANGELOG.md` files.

### What all contributors need to do

- Make your changes (as per usual)
- Before you make a Pull Request, run the `bolt changeset` command and answer the questions that are asked. It will want to know:
  - which packages you want to publish
  - what version you are releasing them at
  - a message to summarise the changes (this message will be written to the changelog of bumped packages)
- Before you accept the changeset, it will inform you of any other dependent packages within the repo that will also be bumped by this changeset. If this looks fine, agree, and a changeset will be generated in the `.changeset` directory.

Each changeset contains two files; `changes.json`, which contains structured data which indicates the packages which need to be updated, and `changes.md`, which contains a markdown snippet which will be included in the `CHANGELOG.md` files for the updated packages.

Here is what a `changeset.json` looks like:

```
{
  "releases": [
    { "name": "@keystone-alpha/adapter-mongoose", "type": "patch" },
    { "name": "@keystone-alpha/keystone", "type": "minor" }
  ],
  "dependents": []
}
```

An example, if you generate a changeset that includes `adapter-mongoose` as a patch, and `keystone` as a minor, you can merge your PR, and the next time the `version-packages` command is run, these will both be updated.

You can have multiple changesets in a single PR. This will give you more granular changelogs, and is encouraged.

## Release Guidelines

## Publishing

### How to do a release

> This should only ever be done by a very short list of core contributors

Releasing is a two-step process. The first step updates the packages, and the second step publishes updated packages to npm.

#### Steps to version packages

The first step is `bolt version-packages`. This will find all changesets that have been created since the last release, and update the version in package.json as specified in those changesets, flattening out multiple bumps to a single package into a single version update.

The `bolt version-packages` command will generate a release commit, which will bump all versions, necessary dependency version changes, and update changelog.mds.

The commands to run are:

```sh
git checkout master
git pull
git branch -D temp-release-branch
git checkout -b temp-release-branch
bolt fresh
bolt version-packages
bolt format
git add .
git commit -m "Run version-packages"
git push --set-upstream origin temp-release-branch
```

Once you have run this you will need to make a pull request to merge this back into master.

#### Release Process

Once the version changes are merged back in to master, to do a manual release:

```sh
git checkout master
git pull
bolt
bolt publish-changed
git push --tags
bolt
```

**Note**: if you have two-factor authentication enabled for npm, you'll need to provide your 2FA code to the `publish-changed` task, like this:

```sh
NPM_CONFIG_OTP=123456 bolt publish-changed
```

The `bolt publish-changed` command finds packages where the version listed in the `package.json` is ahead of the version published on npm, and attempts to publish just those packages.

Because of this, we should keep the following in mind:

- Once the `publish-changed` command has been run, the PR from the `temp-release-branch` should be merged before any other PRs are merged into master, to ensure that no changesets are skipped from being included in a release.
- There is no reason you should ever manually edit the version in the `package.json`

### A quick note on changelogs

The release process will automatically generate and update a `CHANGELOG.md` file, however this does not need to be the only way this file is modified. The changelogs are deliberately static assets so past changelogs can be updated or expanded upon.

In addition, content added above the last released version will automatically be appended to the next release. If your changes do not fit comfortably within the summary of a changelog, we encourage you to add a more detailed account directly into the `CHANGELOG.md`.

## Build Process

Some of the packages in keystone-5 need to compiled before they're published, we use [preconstruct](https://github.com/preconstruct/preconstruct) to do this.

Preconstruct reads from the `packages.json` preconstruct field for configuration, in keystone-5 all we need to do is set the packages that we need to build. Preconstruct reads all of the packages specified in the packages and checks the `main` and `module` fields and generates compiled versions. Preconstruct under the hood uses rollup to bundle all of the modules together which means people can't expose and interact with the modules (e.g. to change internals that could change in a patch version), it's also results in smaller builds because rollup is better at tree shaking than webpack. Preconstruct also uses babel and reads from the babel config in the repo to compile the code, there is one important babel plugin that Preconstruct adds which is `@babel/plugin-transform-runtime` which tells babel to import the helpers that it uses in generated code from a certain place rather than duplicating them in each package.

Preconstruct can generate a couple different types of modules, in keystone-5, we build esm and commonjs modules.

ESM bundles are built for newer bundlers like parcel, rollup and newer versions of webpack which understand ES modules and can build more optimised bundles from them than they can with commonjs.

We also build commonjs builds to run in node (for testing with jest or etc.) and for bundlers which don't understand esm. Preconstruct generates three files for commonjs, a production, development and a file to import those modules. The production one compiles out `process.env.NODE_ENV !== 'production'` checks which are common in front end libraries but `process.env.NODE_ENV` is expensive to check in node if it happens very often.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->

<table><tr><td align="center"><a href="http://www.thinkmill.com.au"><img src="https://avatars3.githubusercontent.com/u/872310?v=4" width="100px;" alt="Jed Watson"/><br /><sub><b>Jed Watson</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=JedWatson" title="Code">💻</a></td><td align="center"><a href="http://jes.st/about"><img src="https://avatars1.githubusercontent.com/u/612020?v=4" width="100px;" alt="Jess Telford"/><br /><sub><b>Jess Telford</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jesstelford" title="Code">💻</a></td><td align="center"><a href="http://www.timl.id.au"><img src="https://avatars0.githubusercontent.com/u/616382?v=4" width="100px;" alt="Tim Leslie"/><br /><sub><b>Tim Leslie</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=timleslie" title="Code">💻</a></td><td align="center"><a href="https://hamil.town"><img src="https://avatars1.githubusercontent.com/u/11481355?v=4" width="100px;" alt="Mitchell Hamilton"/><br /><sub><b>Mitchell Hamilton</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=mitchellhamilton" title="Code">💻</a></td><td align="center"><a href="https://twitter.com/JossMackison"><img src="https://avatars3.githubusercontent.com/u/2730833?v=4" width="100px;" alt="Joss Mackison"/><br /><sub><b>Joss Mackison</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jossmac" title="Code">💻</a></td><td align="center"><a href="http://nathansimpson.design"><img src="https://avatars2.githubusercontent.com/u/12689383?v=4" width="100px;" alt="Nathan Simpson"/><br /><sub><b>Nathan Simpson</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=nathansimpsondesign" title="Code">💻</a></td><td align="center"><a href="https://github.com/mikehazell"><img src="https://avatars0.githubusercontent.com/u/814227?v=4" width="100px;" alt="Mike"/><br /><sub><b>Mike</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=mikehazell" title="Code">💻</a></td></tr><tr><td align="center"><a href="https://github.com/molomby"><img src="https://avatars0.githubusercontent.com/u/2416367?v=4" width="100px;" alt="John Molomby"/><br /><sub><b>John Molomby</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=molomby" title="Code">💻</a></td><td align="center"><a href="https://dominik-wilkowski.com"><img src="https://avatars3.githubusercontent.com/u/1266923?v=4" width="100px;" alt="Dominik Wilkowski"/><br /><sub><b>Dominik Wilkowski</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=dominikwilkowski" title="Code">💻</a></td><td align="center"><a href="https://github.com/Noviny"><img src="https://avatars1.githubusercontent.com/u/15622106?v=4" width="100px;" alt="Ben Conolly"/><br /><sub><b>Ben Conolly</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=Noviny" title="Code">💻</a></td><td align="center"><a href="https://github.com/jaredcrowe"><img src="https://avatars1.githubusercontent.com/u/4995433?v=4" width="100px;" alt="Jared Crowe"/><br /><sub><b>Jared Crowe</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=jaredcrowe" title="Code">💻</a></td><td align="center"><a href="https://www.linkedin.com/in/gautamsi"><img src="https://avatars2.githubusercontent.com/u/5769869?v=4" width="100px;" alt="Gautam Singh"/><br /><sub><b>Gautam Singh</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=gautamsi" title="Code">💻</a></td><td align="center"><a href="https://github.com/lukebatchelor"><img src="https://avatars2.githubusercontent.com/u/18694878?v=4" width="100px;" alt="lukebatchelor"/><br /><sub><b>lukebatchelor</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=lukebatchelor" title="Code">💻</a></td><td align="center"><a href="http://www.ticidesign.com"><img src="https://avatars2.githubusercontent.com/u/289889?v=4" width="100px;" alt="Ticiana de Andrade"/><br /><sub><b>Ticiana de Andrade</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=ticidesign" title="Code">💻</a></td></tr><tr><td align="center"><a href="https://github.com/aghaabbasq"><img src="https://avatars2.githubusercontent.com/u/17919384?v=4" width="100px;" alt="aghaabbasq"/><br /><sub><b>aghaabbasq</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=aghaabbasq" title="Code">💻</a></td><td align="center"><a href="http://ajaymathur.github.io/"><img src="https://avatars1.githubusercontent.com/u/9667784?v=4" width="100px;" alt="Ajay Narain Mathur"/><br /><sub><b>Ajay Narain Mathur</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/commits?author=ajaymathur" title="Code">💻</a></td><td align="center"><a href="https://github.com/mshavliuk"><img src="https://avatars0.githubusercontent.com/u/6589665?v=4" width="100px;" alt="mshavliuk"/><br /><sub><b>mshavliuk</b></sub></a><br /><a href="https://github.com/keystonejs/keystone-5/issues?q=author%3Amshavliuk" title="Bug reports">🐛</a> <a href="https://github.com/keystonejs/keystone-5/commits?author=mshavliuk" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
