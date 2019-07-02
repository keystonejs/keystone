// @flow
import is from 'sarcastic';
import nodePath from 'path';
import { validateEntrypoint } from './validate';
import { Item } from './item';
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

  get configSource(): string {
    return is(this._config.source, is.default(is.string, 'src/index'));
  }

  get source(): string {
    return resolve.sync(nodePath.join(this.directory, this.configSource), {
      extensions: EXTENSIONS,
    });
  }

  _strict: StrictEntrypoint;
  strict(): StrictEntrypoint {
    if (!this._strict) {
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
  get module(): string {
    return is(this.json.module, is.string);
  }
  set module(path: string) {
    this.json.module = path;
  }
  updater(json: Object) {
    super.updater(json);
    validateEntrypoint(this, false);
  }
  strict() {
    return this;
  }
}
