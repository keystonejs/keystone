// @flow
import is from 'sarcastic';
import { readFileSync } from 'fs';
import * as fs from 'fs-extra';
import nodePath from 'path';
import { validateEntrypoint } from './validate';
import { Item } from './item';
import { getNameForDist } from './utils';
import { confirms, errors } from './messages';
import { validatePackage } from './validate-package';
import resolve from 'resolve';
import { EXTENSIONS } from './constants';

/*::
import { Package } from './package'
*/

export class Entrypoint extends Item {
  package: Package;

  constructor(filePath: string, contents: string, pkg: Package) {
    super(filePath, contents);
    this.package = pkg;
  }

  static async create(directory: string, pkg: Package): Promise<Entrypoint> {
    let filePath = nodePath.join(directory, 'package.json');
    let contents;

    try {
      contents = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      if (e.code === 'ENOENT' && pkg.directory !== directory) {
        let shouldCreateEntrypointPkgJson = await confirms.createEntrypointPkgJson({
          name: nodePath.join(pkg.name, nodePath.relative(pkg.directory, directory)),
        });
        if (!shouldCreateEntrypointPkgJson) {
          throw new Error(errors.noEntrypointPkgJson);
        }
        contents = JSON.stringify({ main: `dist/${getNameForDist(pkg.name)}.cjs.js` }, null, 2);
        await fs.writeFile(filePath, contents);
      } else {
        throw e;
      }
    }
    return new Entrypoint(filePath, contents, pkg);
  }
  static createSync(directory: string, pkg: Package): Entrypoint {
    let filePath = nodePath.join(directory, 'package.json');
    let contents = readFileSync(filePath, 'utf-8');
    return new Entrypoint(filePath, contents, pkg);
  }

  get name(): string {
    return nodePath.join(
      this.package.name,
      nodePath.relative(this.package.directory, this.directory)
    );
  }

  get main(): string | null {
    return is(this.json.main, is.maybe(is.string));
  }
  set main(path: string) {
    this.json.main = path;
  }
  get module(): string | null {
    return is(this.json.module, is.maybe(is.string));
  }
  set module(path: string) {
    this.json.module = path;
  }
  get browser(): null | string | { [key: string]: string } {
    return is(this.json.browser, is.maybe(is.either(is.string, is.objectOf(is.string))));
  }
  set browser(option: string | { [key: string]: string }) {
    this.json.browser = option;
  }
  get reactNative(): null | string | { [key: string]: string } {
    return is(this.json['react-native'], is.maybe(is.either(is.string, is.objectOf(is.string))));
  }
  set reactNative(option: string | { [key: string]: string }) {
    this.json['react-native'] = option;
  }

  get umdMain(): string | null {
    return is(this.json['umd:main'], is.maybe(is.string));
  }
  set umdMain(path: string) {
    this.json['umd:main'] = path;
  }

  get configSource(): string {
    return is(this._config.source, is.default(is.string, 'src/index'));
  }

  get source(): string {
    return resolve.sync(nodePath.join(this.directory, this.configSource), {
      extensions: EXTENSIONS,
    });
  }
  get umdName(): null | string {
    return is(this._config.umdName, is.maybe(is.string));
  }
  set umdName(umdName: null | string) {
    if (umdName === null) {
      delete this._config.umdName;
    } else {
      this._config.umdName = umdName;
    }
  }

  _strict: StrictEntrypoint;
  strict(): StrictEntrypoint {
    if (!this._strict) {
      validatePackage(this.package);
      validateEntrypoint(this, false);
      this._strict = new StrictEntrypoint(this.path, this._contents, this.package);
    }
    return this._strict;
  }
}

export class StrictEntrypoint extends Entrypoint {
  get main(): string {
    return is(this.json.main, is.string);
  }
  set main(path: string) {
    this.json.main = path;
  }
  updater(json: Object) {
    super.updater(json);
    validatePackage(this.package);
    validateEntrypoint(this, false);
  }
  strict() {
    return this;
  }
}
