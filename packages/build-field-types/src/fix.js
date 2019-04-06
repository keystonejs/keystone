// @flow
import { Project } from './project';
import { success } from './logger';
import { validateEntrypointSource } from './validate';
import { FatalError } from './errors';
import { errors } from './messages';
/*::
import { Package } from "./package";
*/

export async function fixPackage(pkg: Package) {
  if (pkg.entrypoints.length === 0) {
    throw new FatalError(errors.noEntrypoints, pkg);
  }
  let fields = ['main', 'module'];

  fields.forEach(field => {
    pkg.setFieldOnEntrypoints(field);
  });
  return (await Promise.all(pkg.entrypoints.map(x => x.save()))).some(x => x);
}

export default async function fix(directory: string) {
  let { packages } = await Project.create(directory);

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
