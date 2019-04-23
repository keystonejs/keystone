// @flow

import { Project } from '../project';
import path from 'path';

export type Aliases = {
  [key: string]: string,
};

export function getAliases(project: Project, getKey: string => string = x => x): Aliases {
  let aliases = {};
  project.packages.forEach(pkg => {
    pkg.entrypoints
      .map(x => x.strict())
      .forEach(entrypoint => {
        aliases[getKey(entrypoint.name)] = path.join(
          pkg.name,
          path.relative(entrypoint.directory, entrypoint.source)
        );
      });
  });
  return aliases;
}
