import is from 'sarcastic';
import nodePath from 'path';
import { validateEntrypoint } from './validate';
import { Item } from './item';
import resolve from 'resolve';
import { EXTENSIONS } from './constants';

/*::
import type { Package } from './package'
*/

export class Entrypoint extends Item {
  constructor(filePath, contents, pkg) {
    super(filePath, contents);
    this.package = pkg;
  }

  get name() {
    return nodePath.join(
      this.package.name,
      nodePath.relative(this.package.directory, this.directory)
    );
  }

  get main() {
    return is(this.json.main, is.maybe(is.string));
  }
  set main(path) {
    this.json.main = path;
  }
  get module() {
    return is(this.json.module, is.maybe(is.string));
  }
  set module(path) {
    this.json.module = path;
  }

  get configSource() {
    return is(this._config.source, is.default(is.string, 'src/index'));
  }

  get source() {
    return resolve.sync(nodePath.join(this.directory, this.configSource), {
      extensions: EXTENSIONS,
    });
  }

  strict() {
    if (!this._strict) {
      validateEntrypoint(this, false);
      this._strict = new StrictEntrypoint(this.path, this._contents, this.package);
    }
    return this._strict;
  }
}

export class StrictEntrypoint extends Entrypoint {
  get main() {
    return is(this.json.main, is.string);
  }
  set main(path) {
    this.json.main = path;
  }
  get module() {
    return is(this.json.module, is.string);
  }
  set module(path) {
    this.json.module = path;
  }
  updater(json) {
    super.updater(json);
    validateEntrypoint(this, false);
  }
  strict() {
    return this;
  }
}
