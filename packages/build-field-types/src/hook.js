// @flow
import { Project } from './project';
import { EXTENSIONS } from './constants';
// $FlowFixMe
import Module from 'module';
import { addHook } from 'pirates';
import * as babel from '@babel/core';
import sourceMapSupport from 'source-map-support';

// this is a require hook for dev
// how it works is, first we customise the way filenames are resolved

let babelPlugins = [
  require.resolve('../babel-plugins/ks-field-types-dev'),
  require.resolve('@babel/plugin-transform-runtime'),
];

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
      return babel.transformSync(code, {
        filename,
        sourceMaps: 'inline',
        plugins: [
          ...babelPlugins,
          ({ types: t }) => {
            return {
              visitor: {
                Program: {
                  exit(path) {
                    let unregisterIdentifier = path.scope.generateUidIdentifier(
                      'unregisterBuildFieldTypesRequireHook'
                    );
                    path.node.body.unshift(
                      t.variableDeclaration(
                        'var',
                        t.variableDeclarator(
                          unregisterIdentifier,
                          t.callExpression(
                            t.memberExpression(
                              t.callExpression(t.identifier('require'), [
                                t.stringLiteral(__filename),
                              ]),
                              '___internalHook'
                            ),
                            []
                          )
                        )
                      )
                    );
                    path.node.body.push(t.callExpression(t.cloneNode(unregisterIdentifier), []));
                  },
                },
              },
            };
          },
        ],
      });
    },
    { matcher, exts: EXTENSIONS }
  );

  sourceMapSupport.install({ environment: 'node', hookRequire: true });
};

export let ___internalHook = () => {
  let compiling = false;

  function compileHook(code, filename) {
    if (compiling) return code;

    try {
      compiling = true;
      return babel.transformSync(code, {
        plugins: babelPlugins,
        filename,
        sourceMaps: 'inline',
      });
    } finally {
      compiling = false;
    }
  }

  return addHook(compileHook, {
    exts: EXTENSIONS,
  });
};
