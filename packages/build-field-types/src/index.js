// @flow

// why is this better than assuming src/index.js?
// because if we allow other entrypoints in the future,
// we can support that here and the same config that's
// used for bundling will be used for aliasing
import { Project } from './project';

function getAbsoluteAliases(cwd, converter = x => x) {
  let project = Project.createSync(cwd);
  let aliases = {};

  project.packages.forEach(pkg => {
    pkg.entrypoints
      .map(x => x.strict())
      .forEach(entrypoint => {
        aliases[converter(entrypoint.name)] = entrypoint.source;
      });
  });

  return aliases;
}

function getAbsoluteAbsoluteAliases(cwd, converter = x => x) {
  let project = Project.createSync(cwd);
  let aliases = {};

  project.packages.forEach(pkg => {
    pkg.entrypoints
      .map(x => x.strict())
      .forEach(entrypoint => {
        aliases[converter(entrypoint.directory)] = entrypoint.source;
      });
  });

  return aliases;
}

// TODO: come back to this and see if getAbsoluteAbsoluteAliases will work for everything

// inspired by https://github.com/Andarist/lerna-alias
export let aliases = {
  jest(cwd: string = process.cwd()) {
    return getAbsoluteAliases(cwd, name => `^${name}$`);
  },
  rollup(cwd: string = process.cwd()) {
    return getAbsoluteAliases(cwd);
  },
  webpack(cwd: string = process.cwd()) {
    return {
      ...getAbsoluteAliases(cwd, name => `${name}$`),
      ...getAbsoluteAbsoluteAliases(cwd, name => `${name}$`),
    };
  },
};
