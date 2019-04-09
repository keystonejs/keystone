// @flow
import { Project } from './project';
import { EXTENSIONS } from './constants';
import Module from 'module';
import { addHook } from 'pirates';
import * as babel from '@babel/core';
import sourceMapSupport from 'source-map-support';

export let hook = (projectDir: string) => {
  let project = Project.createSync(projectDir);

  let aliases = {};

  let sources = {};

  project.packages.forEach(pkg => {
    pkg.entrypoints.forEach(entrypoint => {
      aliases[entrypoint.name] = entrypoint.source;
      sources[entrypoint.source] = true;
    });
  });

  let oldResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function(request, parentModule, isMain) {
    if (aliases[request] !== undefined) {
      return aliases[request];
    }
    return oldResolveFilename.call(this, request, parentModule, isMain);
  };

  function matcher(filename) {
    return sources[filename] === true;
  }

  addHook(
    (code, filename) => {
      return `
      const _________BUILD_FIELD_TYPES = require('${__filename}').register
      `;
    },
    { matcher }
  );

  sourceMapSupport.install({ environment: 'node', hookRequire: true });
};

export let ___internalHook = () => {
  let compiling = false;

  function compileHook(code, filename) {
    if (compiling) return code;

    try {
      compiling = true;
      return babel.transformSync(code, { filename, sourceMaps: 'inline' });
    } finally {
      compiling = false;
    }
  }

  return addHook(compileHook, {
    exts: EXTENSIONS,
  });
};
