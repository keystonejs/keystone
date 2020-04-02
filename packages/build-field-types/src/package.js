// based on https://github.com/jamiebuilds/std-pkg but reading fewer things, adding setters and reading the file
import is from 'sarcastic';
import globby from 'globby';
import * as fs from 'fs-extra';
import nodePath from 'path';
import { Item } from './item';
import { Entrypoint } from './entrypoint';
import { FatalError } from './errors';
import { confirms, errors } from './messages';
import { getValidMainField, getValidModuleField } from './utils';

/*::
import {Project} from './project'
*/

export class Package extends Item {
  get configEntrypoints() {
    return is(this._config.entrypoints, is.default(is.arrayOf(is.string), ['.']));
  }
  static async create(directory) {
    let filePath = nodePath.join(directory, 'package.json');

    let contents = await fs.readFile(filePath, 'utf-8');
    let pkg = new Package(filePath, contents);

    let entrypointDirectories = await globby(pkg.configEntrypoints, {
      cwd: pkg.directory,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    pkg.entrypoints = await Promise.all(
      entrypointDirectories.map(async directory => {
        let filename = nodePath.join(directory, 'package.json');

        let contents = null;

        try {
          contents = await fs.readFile(filename, 'utf-8');
        } catch (e) {
          if (e.code !== 'ENOENT') {
            throw e;
          }
        }

        return { filename, contents };
      })
    ).then(descriptors => {
      return Promise.all(
        descriptors.map(async ({ filename, contents }) => {
          if (contents === null) {
            let shouldCreateEntrypointPkgJson = await confirms.createEntrypointPkgJson({
              name: nodePath.join(pkg.name, nodePath.relative(pkg.directory, directory)),
            });
            if (!shouldCreateEntrypointPkgJson) {
              throw new FatalError(errors.noEntrypointPkgJson, {
                name: nodePath.join(pkg.name, nodePath.relative(pkg.directory, directory)),
              });
            }
            contents = JSON.stringify(
              {
                main: getValidMainField(pkg.name),
                module: getValidModuleField(pkg.name),
              },
              null,
              2
            );
            await fs.writeFile(filename, contents);
          }
          return new Entrypoint(filename, contents, pkg);
        })
      );
    });

    return pkg;
  }

  setFieldOnEntrypoints(field) {
    this.entrypoints.forEach(entrypoint => {
      switch (field) {
        case 'main': {
          entrypoint.main = getValidMainField(this.name);
          break;
        }
        case 'module': {
          entrypoint.module = getValidModuleField(this.name);
          break;
        }
      }
    });
  }

  get name() {
    return is(this.json.name, is.string);
  }
  set name(name) {
    this.json.name = name;
  }

  get dependencies() {
    return is(this.json.dependencies, is.maybe(is.objectOf(is.string)));
  }
  get peerDependencies() {
    return is(this.json.peerDependencies, is.maybe(is.objectOf(is.string)));
  }
}
