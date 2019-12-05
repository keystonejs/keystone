import { PKG_JSON_CONFIG_FIELD } from './constants';

export let errors = {
  noSource: source =>
    `no source file was provided, please create a file at ${source} or specify a custom source file with the ${PKG_JSON_CONFIG_FIELD} source option`,
  deniedWriteMainModuleFields: 'changing the main and module field is required to build',
  invalidModuleField: 'module field is invalid',
  invalidMainField: 'main field is invalid',
  noEntrypointPkgJson: 'There is a missing package.json for an entrypoint',
  noEntrypoints: 'packages must have at least one entrypoint, this package has no entrypoints',
};

import { createPromptConfirmLoader } from './prompt';

export let confirms = {
  writeMainModuleFields: createPromptConfirmLoader(
    'build-field-types is going to change the main and module field in your package.json, are you okay with that?'
  ),
  shouldInstallBabelRuntime: createPromptConfirmLoader(
    'Babel helpers (functions inserted by babel transforms) should be imported from a @babel/runtime package (which has to be in your dependencies) to reduce bundle size. would you like to install @babel/runtime automatically?'
  ),
  createEntrypointPkgJson: createPromptConfirmLoader(
    'A package.json file does not exist for this entrypoint, would you like to create one automatically?'
  ),
};

export let infos = {
  validMainField: 'main field is valid',
  validModuleField: 'module field is valid',
  validEntrypoint: 'a valid entry point exists.',
  validPackageEntrypoints: 'package entrypoints are valid',
};

export let successes = {
  validProject: 'project is valid!',
  startedWatching: 'started watching!',
};
