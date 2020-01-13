import { Project } from './project';
import { success } from './logger';
import { validateEntrypointSource } from './validate';
import { FatalError } from './errors';
import { errors } from './messages';
/*::
import { Package } from "./package";
*/

export async function fixPackage(pkg) {
  if (pkg.entrypoints.length === 0) {
    throw new FatalError(errors.noEntrypoints, pkg);
  }
  pkg.setFieldOnEntrypoints('main');
  pkg.setFieldOnEntrypoints('module');

  return (await Promise.all(pkg.entrypoints.map(x => x.save()))).some(x => x);
}

export default async function fix(directory) {
  let { packages } = await Project.create(directory);

  let didModify = (
    await Promise.all(
      packages.map(async pkg => {
        pkg.entrypoints.forEach(validateEntrypointSource);
        let didModifyInPkgFix = await fixPackage(pkg);
        return didModifyInPkgFix;
      })
    )
  ).some(x => x);

  success(didModify ? `fixed project!` : `project already valid!`);
}
