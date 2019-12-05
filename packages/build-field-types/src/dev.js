import { Project } from './project';
import { success, info } from './logger';
import * as fs from 'fs-extra';
import path from 'path';

export default async function dev(projectDir) {
  let project = await Project.create(projectDir);
  project.packages.forEach(({ entrypoints }) => entrypoints.forEach(x => x.strict()));
  info('project is valid!');

  let promises = [];
  await Promise.all(
    project.packages.map(pkg => {
      return Promise.all(
        pkg.entrypoints.map(async _entrypoint => {
          let entrypoint = _entrypoint.strict();
          await fs.remove(path.join(entrypoint.directory, 'dist'));

          await fs.ensureDir(path.join(entrypoint.directory, 'dist'));
          await Promise.all([
            fs.symlink(entrypoint.source, path.join(entrypoint.directory, entrypoint.module)),
            fs.writeFile(
              path.join(entrypoint.directory, entrypoint.main),
              `"use strict";

let unregister = require(${JSON.stringify(
                require.resolve('@preconstruct/hook')
              )}).___internalHook(${JSON.stringify(project.directory)});

module.exports = require(${JSON.stringify(entrypoint.source)});

unregister();
`
            ),
          ]);
        })
      );
    })
  );

  await Promise.all(promises);

  success('created links!');
}
