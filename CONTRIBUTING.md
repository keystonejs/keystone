# Contributing

Contributions to KeystoneJS in the form of issues and PRs are welcomed.

Contributions which improve the documentation and test coverage are particularly welcomed.

### Community Ecosystem

Keystone makes no assumptions about type of applications it powers. It achieves flexibility through small, highly composable parts that allow you to build a foundation for a broad variety of applications.

For this reason we might not add features to Keystone if they are prescriptive about:

- Data structures
- Workflows
- Access controls
- Front-end application UI

But we want your contributions! We recognise many types of applications share common features and prescriptive patterns can sometimes be helpful, even at the expense of flexibility.

If you develop custom fields, adapters, apps or any other Keystone feature, (or have an idea) join us on the [Keystone Slack channel](https://community.keystonejs.com) or make a pull request to [KeystoneJS-Contrib](https://github.com/keystonejs-contrib/keystonejs-contrib) and we will add it to our list of community libraries.

## Code of Conduct

KeystoneJS adheres to the [Contributor Covenant Code of Conduct](/CODE-OF-CONDUCT.md).

## Repository Setup

KeystoneJS follows the [Thinkmill Monorepo Style Guide](https://github.com/Thinkmill/monorepo). For more information on the reasoning behind using certain tooling, please refer to it.

### Version management

Keystone uses @noviny's [@changesets/cli](https://github.com/noviny/changesets) to track package versions and publish packages.
This tool allows each PR to indicate which packages need a version bump along with a changelog snippet.
This information is then collated when performing a release to update package versions and `CHANGELOG.md` files.

#### What all contributors need to do

- Make your changes (as per usual)
- Before you make a Pull Request, run the `yarn changeset` command and answer the questions that are asked. It will want to know:
  - which packages you want to publish
  - what version you are releasing them at
  - a message to summarise the changes (this message will be written to the changelog of bumped packages)
- Before you accept the changeset, it will display all the data that will be written to the changeset. If this looks fine, agree, and a changeset will be generated in the `.changeset` directory.

After this, a new changeset will be added which is a markdown file with YAML front matter.

```
-| .changeset/
-|-| UNIQUE_ID.md
```

The message you typed can be found in the markdown file. If you want to expand on it, you can write as much markdown as you want, which will all be added to the changelog on publish. If you want to add more packages or change the bump types of any packages, that's also fine.

While not every changeset is going to need a huge amount of detail, a good idea of what should be in a changeset is:

- WHAT the change is
- WHY the change was made
- HOW a consumer should update their code

An example, if you generate a changeset that includes `auth` as a patch, and `core` as a minor, you can merge your PR, and the next time the `version-packages` command is run, these will both be updated.

```md
---
'@keystone-6/auth': patch
'@keystone-6/core': minor
---

A very useful description of the changes should be here.
```

You can have multiple changesets in a single PR. This will give you more granular changelogs, and is encouraged.

#### Changeset guidelines

We’re sometimes lovingly picky on the wording of our changesets because these end up in changelogs that people like you read. We want to try to get a consistent tone of voice while providing useful information to the reader.

In particular, please try to write in the past tense (e.g. "Added a new feature" rather than "Add a new feature") and write in complete sentences. This means proper capitalisation and punctuation, including full stops/periods at the end of sentences. We try to be terse when possible but if needed it's fine to write multiple lines including examples for changing APIs.

Thanks for your help with this.

### How we version packages

Keystone follows the semver model of {major}.{minor}.{patch}. Version numbers are the first and most obvious way we have of communicating changes to our users, so it's important we convey consistent meaning with them, and strike a careful balance between releasing often vs. overloading consumers with package updates.

Generally, versions should be interpreted like:

- `major` means a breaking change to the public API of a package, and/or a meaningful change to the internal behaviour
- `minor` means we added a feature to the package, which is backwards compatible with the current major version
- `patch` means a bug has been fixed in the package

If a PR includes any of the above, it needs a changeset so the updated packages get released and versioned correctly.

Other reasons for versioning packages include:

- If a dependency is updated, and that dependency's API is exposed, the package exposing the API should be bumped by the same level as the dependency being updated. For example a new major version of mongoose would warrant a new major version of keystone.
- If a dependency is updated, and that dependency is not exposed, it may be important to release a package with the update, for example with security fixes. In that case, the package would be bumped with a `patch` version.

#### Versioning UI changes

Front-end packages (the Admin UI, Design System, etc) should always follow the rules above for API changes, but may also warrant a version bump for UI changes without an API change. This is more open to interpretation, but should follow the spirit of the rules above:

- `major` should be used if we're meaningfully changing how the UI looks or works (think: should we update screenshots on the website? might users need to relearn something they know how to do?)
- `minor` should be used if a new feature is available
- `patch` should be used if something has been tweaked or fixed

#### Versioning example projects

Since the example projects don't get published anywhere and don't expose API, it's less obvious when they should be versioned. In this case, think of "someone referring to the example project" as an API consumer, and use the version number to communicate anything they should know.

- `major` means the example has been meaningfully changed, and the difference would break expectations about how it works
- `minor` means the example has had features added or is significantly improved
- `patch` means something has been fixed

Minor refactoring, including incorporating changes to Keystone APIs, would not warrant updating the package version.

Generally, these guidelines are in place so that we don't spam consumers with version upgrades that don't provide value. They are subjective however, and not "one size fits all" so if you're not sure whether a change warrants a version bump, ask for advice in the PR.

### Release Guidelines

#### How to do a release

> This should only ever be done by a very short list of core contributors

Releasing is a two-step process. The first step updates the packages, and the second step publishes updated packages to npm.

##### Update Packages (automatic)

This step is handled for us by the Changesets GitHub Action. As PRs are opened
against `main`, the bot will open and update a PR which generates the
appropriate `CHANGELOG.md` entries and `package.json` version bumps.

Once ready for a release, merge the bot's PR into `main`.

> _NOTE: For information on manually updating packages, see [Update Packages
> (manual)](#update-packages-manual)_

##### Publish Packages

Once the version changes are merged back in to main, to do a manual release:

```sh
yarn fresh && \
yarn publish-changed && \
git push --tags
```

The `yarn publish-changed` command finds packages where the version listed in the `package.json` is ahead of the version published on npm, and attempts to publish just those packages.

NOTE: There is no reason you should ever manually edit the version in the `package.json`

##### Update Packages (manual)

If you wish to do a manual release (useful for back-porting fixes), follow these
steps. Otherwise, skip on to the next section for _Publishing Packages_.

The first step is `yarn version-packages`. This will find all changesets that have been created since the last release, and update the version in package.json as specified in those changesets, flattening out multiple bumps to a single package into a single version update.

The `yarn version-packages` command will generate a release commit, which will bump all versions, necessary dependency version changes, and update changelog.mds.

The commands to run are:

```sh
git checkout main && \
git pull && \
git branch -D temp-release-branch && \
git checkout -b temp-release-branch && \
yarn fresh && \
yarn build && \
yarn version-packages && \
yarn format && \
git add . && \
git commit -m "Version packages" && \
git push --set-upstream origin temp-release-branch
```

Once you have run this you will need to make a pull request to merge this back into main.

Finally, make sure you've got the latest of everything locally

```sh
git checkout main && \
git pull && \
yarn
```

#### A quick note on changelogs

The release process will automatically generate and update a `CHANGELOG.md` file, however this does not need to be the only way this file is modified. The changelogs are deliberately static assets so past changelogs can be updated or expanded upon.

In addition, content added above the last released version will automatically be appended to the next release. If your changes do not fit comfortably within the summary of a changelog, we encourage you to add a more detailed account directly into the `CHANGELOG.md`.

#### Backporting Fixes

Occasionally a bug goes undetected for a few versions. When a fix is discovered,
it may need to be applied to all affected versions (depending on the
severity, security considerations, etc). This is called _backporting_.

First, find out the oldest version which was affected. This can be done using
`git blame`, browsing the `CHANGELOG.md`s, etc.

Once we know which version introduced the bug, walk forward through the
`CHANGELOG.md` noting all the _minor_ and _major_ releases made since.

> Example: If a bug was introduced in `14.0.0`, but not discovered until after
> `15.1.1` was released, the list of _minor_ and _major_ releases may look like:
>
> - `14.0.x`
> - `14.1.x`
> - `15.0.x`
> - `15.1.x`

We're going to do a backport and release for the HEAD of every _minor_ and
_major_ release, ignoring any interim patch releases.

> Example: These may be the releases we'd backport to:
>
> - ❌ `14.0.0`
> - ✅ `14.0.1`
> - ✅ `14.1.0`
> - ❌ `15.0.0`
> - ❌ `15.0.1`
> - ✅ `15.0.2`
> - ✅ `15.1.0`

Now, for each release we want to backport to, we follow this process:

1. Checkout the tag of the release

   Let's say the package being patched is `@keystonejs/keystone`, then we
   want to run:

   ```sh
   git checkout -b backport-keystone-14.0.1 @keystonejs/keystone@14.0.1
   ```

2. Cherry pick the commit across.

   Fix any merge conflicts that might arise.

   NOTE: Make sure the changeset is either regenerated or edited to accurately
   relfect the change to the one package you're bumping, otherwise weirdness
   will happen.

   ```sh
   git cherry-pick abc123123
   ```

3. Bump package versions

   ```sh
   yarn fresh --prefer-offline && \
   yarn build && \
   yarn version-packages && \
   yarn format && \
   git add . && \
   git commit -m "Backport fix"
   ```

4. Do _NOT_ open a PR

   This change is not going to be PR'd into main. Instead we'll later push
   the tag which contains the commits.

   To confirm everything is as expected, look at the git log:

   ```sh
   git log -p
   ```

5. Publish the newly version bumped package

   Note we can't use changesets to do this special publish as it doesn't handle backports.

   ```sh
   (\
   export PACKAGE_NAME=@keystonejs/keystone && \
   export OTP_CODE= && \
   cd packages/keystone && \
   yarn publish --tag=backport --otp=$OTP_CODE && \
   export BACKPORTED_VERSION=`npm dist-tag ls $PACKAGE_NAME | grep 'backport' | sed -e 's/backport: //'` && \
   yarn tag remove $PACKAGE_NAME backport --otp=$OTP_CODE && \
   git tag -a "$PACKAGE_NAME@$BACKPORTED_VERSION" -m "$PACKAGE_NAME@$BACKPORTED_VERSION"
   git push --tags \
   )
   ```

   _NOTE: When prompted for "New version", just hit Enter_

   <!-- this was the cd command but we don't have a command to replace the exact bolt part yet: cd `bolt ws $PACKAGE_NAME exec -- pwd | grep pwd | sed -e 's/.*pwd[ ]*//'` && \ w
   -->

6. Confirm it was published

   ```sh
   npm show <PACKAGE_NAME> versions
   ```

### Build Process

Some of the packages in keystone need to compiled before they're published, we use [preconstruct](https://github.com/preconstruct/preconstruct) to do this.

Preconstruct reads from the `packages.json` preconstruct field for configuration, in all we need to do is set the packages that we need to build. Preconstruct reads all of the packages specified in the packages and checks the `main` and `module` fields and generates compiled versions. Preconstruct under the hood uses rollup to bundle all of the modules together which means people can't expose and interact with the modules (e.g. to change internals that could change in a patch version). It also results in smaller builds because rollup is better at tree shaking than webpack. Preconstruct also uses babel and reads from the babel config in the repo to compile the code, there is one important babel plugin that Preconstruct adds which is `@babel/plugin-transform-runtime` which tells babel to import the helpers that it uses in generated code from a certain place rather than duplicating them in each package.

Preconstruct can generate a couple different types of modules, in keystone, we build esm and commonjs modules.

ESM bundles are built for newer bundlers like parcel, rollup and newer versions of webpack which understand ES modules and can build more optimised bundles from them than they can with commonjs.

We also build commonjs builds to run in node (for testing with jest or etc.) and for bundlers which don't understand esm. Preconstruct generates three files for commonjs, a production, development and a file to import those modules. The production one compiles out `process.env.NODE_ENV !== 'production'` checks which are common in front end libraries but `process.env.NODE_ENV` is expensive to check in node if it happens very often.
