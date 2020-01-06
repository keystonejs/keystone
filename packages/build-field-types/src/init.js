import { Project } from './project';
import { FixableError } from './errors';
import { success, info } from './logger';
import { infos, confirms, errors } from './messages';
import { validateEntrypointSource, isMainFieldValid, isModuleFieldValid } from './validate';

export default async function init(directory) {
  let project = await Project.create(directory);

  await Promise.all(
    project.packages.map(async pkg => {
      pkg.entrypoints.forEach(entrypoint => {
        validateEntrypointSource(entrypoint);
      });
      if (
        pkg.entrypoints.every(entrypoint => isMainFieldValid(entrypoint)) &&
        pkg.entrypoints.every(entrypoint => isModuleFieldValid(entrypoint))
      ) {
        info(infos.validMainField, pkg);
      } else {
        let canWriteMainModuleFields = await confirms.writeMainModuleFields(pkg);
        if (!canWriteMainModuleFields) {
          throw new FixableError(errors.deniedWriteMainModuleFields, pkg);
        }
        pkg.setFieldOnEntrypoints('main');
        pkg.setFieldOnEntrypoints('module');
      }

      await Promise.all(pkg.entrypoints.map(x => x.save()));
    })
  );

  success('initialised project!');
}
