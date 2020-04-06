import is from 'sarcastic';
import nodePath from 'path';
import { promptInput } from './prompt';
import globby from 'globby';
import * as fs from 'fs-extra';
import { Item } from './item';
import { Package } from './package';

export class Project extends Item {
  get configPackages() {
    return is(this._config.packages, is.default(is.arrayOf(is.string), ['.']));
  }
  // probably gonna be irrelevant later but i want it for now
  get isBolt() {
    // we only want to return true when there is bolt config
    // AND no yarn workspaces config
    // because emotion has a bolt config and yarn workspaces
    // and if you have both, you probably want workspaces
    let hasBolt = !!this.json.bolt;
    let hasYarnWorkspaces = !!this.json.workspaces;
    return hasBolt && !hasYarnWorkspaces;
  }
  static async create(directory) {
    let filePath = nodePath.join(directory, 'package.json');
    let contents = await fs.readFile(filePath, 'utf-8');
    let project = new Project(filePath, contents);
    project.packages = await project._packages();

    return project;
  }

  get name() {
    return is(this.json.name, is.string);
  }
  set name(name) {
    this.json.name = name;
  }

  async _packages() {
    // suport bolt later probably
    // maybe lerna too though probably not
    if (!this._config.packages && this.json.workspaces) {
      let _workspaces;
      if (Array.isArray(this.json.workspaces)) {
        _workspaces = this.json.workspaces;
      } else if (Array.isArray(this.json.workspaces.packages)) {
        _workspaces = this.json.workspaces.packages;
      }

      let workspaces = is(_workspaces, is.arrayOf(is.string));

      let packages = await promptInput(
        'what packages should build-field-types build?',
        this,
        workspaces.join(',')
      );

      this._config.packages = packages.split(',');

      await this.save();
    }

    let filenames = await globby(this.configPackages, {
      cwd: this.directory,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    let packages = await Promise.all(
      filenames.map(async x => {
        let pkg = await Package.create(x);
        pkg.project = this;
        return pkg;
      })
    );
    return packages;
  }
}
