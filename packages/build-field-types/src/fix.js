// @flow
import { Project } from './project';
import { success } from './logger';
import { validateEntrypointSource } from './validate';
import { fixPackage } from './validate-package';

export default async function fix(directory: string) {
  let { packages } = await Project.create(directory);
  // do more stuff with checking whether the repo is using yarn workspaces or bolt

  let didModify = (await Promise.all(
    packages.map(async pkg => {
      let didModifyInPkgFix = await fixPackage(pkg);
      pkg.entrypoints.forEach(validateEntrypointSource);
      return didModifyInPkgFix;
    })
  )).some(x => x);

  let obj = packages.length > 1 ? 'packages' : 'package';
  success(didModify ? `fixed ${obj}!` : `${obj} already valid!`);
}
