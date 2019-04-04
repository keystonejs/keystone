/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2018 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const isEmpty = require('lodash.isempty');
const omitBy = require('lodash.omitby');
const MagicString = require('magic-string');
const diff = require('diff');
const { getWorker } = require('../worker-client');

const NAME = 'rollup-plugin-prettier';

module.exports = options => {
  let sourcemap = null;
  let newOptions = options;

  if (newOptions && hasSourceMap(newOptions)) {
    sourcemap = isSourceMapEnabled(newOptions);
  }

  newOptions = omitSourceMap(newOptions);
  newOptions = omitCwd(newOptions);

  // Do not send an empty option object.
  if (isEmpty(newOptions)) {
    newOptions = undefined;
  }

  return {
    /**
     * Plugin name (used by rollup for error messages and warnings).
     * @type {string}
     */
    name: NAME,

    /**
     * Function called by `rollup` that is used to read the `sourceMap` setting.
     *
     * @param {Object} opts Rollup options.
     * @return {void}
     */
    options(opts = {}) {
      if (sourcemap == null) {
        // Get the global `sourcemap` option on given object.
        // Should support:
        //  - `sourcemap` (lowercase) option which is the name with rollup >= 0.48.0,
        //  - `sourceMap` (camelcase) option which is the (deprecated) name with rollup < 0.48.0.
        const globalSourcemap = isSourceMapEnabled(opts);

        // Since rollup 0.48, sourcemap option can be set on the `output` object.
        const output = opts.output || {};
        const outputSourceMap = Array.isArray(output)
          ? output.some(isSourceMapEnabled)
          : isSourceMapEnabled(output);

        // Enable or disable `sourcemap` generation.
        sourcemap = globalSourcemap || outputSourceMap;
      }
    },

    /**
     * Function called by `rollup` before generating final bundle.
     *
     * @param {string} source Souce code of the final bundle.
     * @param {Object} chunkInfo Chunk info.
     * @param {Object} outputOptions Output option.
     * @return {Object} The result containing a `code` property and, if a enabled, a `map` property.
     */
    async renderChunk(source, chunkInfo, outputOptions) {
      const output = await getWorker().transformPrettier(source);
      const outputOptionsSourcemap =
        outputOptions == null ? null : isSourceMapEnabled(outputOptions);

      // Should we generate sourcemap?
      // The sourcemap option may be a boolean or any truthy value (such as a `string`).
      // Note that this option should be false by default as it may take a (very) long time.
      if (!sourcemap && !outputOptionsSourcemap) {
        return { code: output };
      }

      console.log(`[${NAME}] Sourcemap is enabled, computing diff is required`);
      console.log(`[${NAME}] This may take a moment (depends on the size of your bundle)`);

      const magicString = new MagicString(source);
      const changes = diff.diffChars(source, output);

      if (changes && changes.length > 0) {
        let idx = 0;

        changes.forEach(part => {
          if (part.added) {
            magicString.prependLeft(idx, part.value);
            idx -= part.count;
          } else if (part.removed) {
            magicString.remove(idx, idx + part.count);
          }

          idx += part.count;
        });
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          hires: true,
        }),
      };
    },
  };
};

const SOURCE_MAPS_OPTS = [
  'sourcemap', // Name of the property with rollup >= 0.48.
  'sourceMap', // Name of the property with rollup < 0.48.
];

/**
 * Create option object from given one removing `cwd` key if present.
 *
 * @param {Object} opts Option object.
 * @return {Object} New option object.
 */
function omitCwd(opts) {
  return omitBy(opts, (v, k) => k === 'cwd');
}

/**
 * Check if `sourcemap` option is defined on option object.
 *
 * @param {Object} opts Options.
 * @return {boolean} `true` if sourcemap is defined, `false` otherwise.
 */
function hasSourceMap(opts) {
  return SOURCE_MAPS_OPTS.some(p => p in opts);
}

/**
 * Check if `sourcemap` option is enable or not.
 *
 * @param {Object} opts Options.
 * @return {boolean} `true` if sourcemap is enabled, `false` otherwise.
 */
function isSourceMapEnabled(opts) {
  return !!SOURCE_MAPS_OPTS.find(p => opts[p]);
}

/**
 * Delete sourcemap option on object.
 *
 * @param {Object} opts The object.
 * @return {Object} Option object without `sourcemap` entry.
 */
function omitSourceMap(opts) {
  return omitBy(opts, (value, key) => SOURCE_MAPS_OPTS.indexOf(key) >= 0);
}
