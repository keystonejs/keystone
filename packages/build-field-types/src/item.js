import * as fs from 'fs-extra';
import nodePath from 'path';
import is from 'sarcastic';
import { PKG_JSON_CONFIG_FIELD } from './constants';

let itemsByPath = {};

export class Item {
  constructor(filePath, contents) {
    this.json = is(JSON.parse(contents), is.object);
    this._stringifiedSavedJson = JSON.stringify(this.json, null, 2);
    this._contents = contents;
    this.path = filePath;
    this.directory = nodePath.dirname(filePath);
    this._config = this.json[PKG_JSON_CONFIG_FIELD] || {};
    if (itemsByPath[this.path] === undefined) {
      itemsByPath[this.path] = new Set();
    }
    itemsByPath[this.path].add(this);
  }

  updater(json) {
    this.json = json;
  }

  async refresh() {
    let contents = await fs.readFile(this.path, 'utf-8');
    let json = is(JSON.parse(contents), is.object);
    for (let item of itemsByPath[this.path]) {
      item.updater(json);
    }
  }
  async save() {
    if (Object.keys(this._config).length) {
      this.json[PKG_JSON_CONFIG_FIELD] = this._config;
    } else {
      delete this.json[PKG_JSON_CONFIG_FIELD];
    }
    let stringified = JSON.stringify(this.json, null, 2);
    if (stringified !== this._stringifiedSavedJson) {
      await fs.writeFile(this.path, JSON.stringify(this.json, null, 2) + '\n');

      this._config = this.json[PKG_JSON_CONFIG_FIELD] || {};
      for (let item of itemsByPath[this.path]) {
        item.updater(this.json);
      }
      this._stringifiedSavedJson = stringified;
      return true;
    }
    return false;
  }
}
