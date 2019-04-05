// @flow
// based on https://github.com/jamiebuilds/std-pkg but reading fewer things, adding setters and reading the file
import is from 'sarcastic';
import globby from 'globby';
import * as fs from 'fs-extra';
import { readFileSync } from 'fs';
import nodePath from 'path';
import { Item } from './item';
import { Entrypoint, StrictEntrypoint } from './entrypoint';
import { getValidMainField, getValidModuleField } from './utils';

/*::
import {Project} from './project'
*/

export class Package extends Item {
  project: Project;
  entrypoints: Array<Entrypoint>;
  get configEntrypoints(): Array<string> {
    return is(this._config.entrypoints, is.default(is.arrayOf(is.string), ['.']));
  }
  static async create(directory: string): Promise<Package> {
    let filePath = nodePath.join(directory, 'package.json');

    let contents = await fs.readFile(filePath, 'utf-8');
    let pkg = new Package(filePath, contents);

    let filenames = await globby(pkg.configEntrypoints, {
      cwd: pkg.directory,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    pkg.entrypoints = await Promise.all(
      filenames.map(async filename => {
        let entrypoint = await Entrypoint.create(filename, pkg);
        return entrypoint;
      })
    );

    return pkg;
  }
  static createSync(directory: string): Package {
    let filePath = nodePath.join(directory, 'package.json');
    let contents = readFileSync(filePath, 'utf-8');
    let pkg = new Package(filePath, contents);
    let filenames = globby.sync(pkg.configEntrypoints, {
      cwd: pkg.directory,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    pkg.entrypoints = filenames.map(filename => {
      let entrypoint = Entrypoint.createSync(filename, pkg);
      return entrypoint;
    });
    return pkg;
  }

  setFieldOnEntrypoints(field: 'main' | 'module') {
    this.entrypoints.forEach(entrypoint => {
      switch (field) {
        case 'main': {
          entrypoint.main = getValidMainField(entrypoint);
          break;
        }
        case 'module': {
          entrypoint.module = getValidModuleField(entrypoint);
          break;
        }
      }
    });
  }

  get name(): string {
    return is(this.json.name, is.string);
  }
  set name(name: string) {
    this.json.name = name;
  }

  get dependencies(): null | { [key: string]: string } {
    return is(this.json.dependencies, is.maybe(is.objectOf(is.string)));
  }
  get peerDependencies(): null | { [key: string]: string } {
    return is(this.json.peerDependencies, is.maybe(is.objectOf(is.string)));
  }
}

export class StrictPackage extends Package {
  strictEntrypoints: Array<StrictEntrypoint>;
}
