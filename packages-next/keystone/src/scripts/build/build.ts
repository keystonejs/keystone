import Path from 'path';
import prettier from 'prettier';
import fs from 'fs-extra';
import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { saveSchemaAndTypes } from '../../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

// FIXME: Duplicated from admin-ui package. Need to decide on a common home.
export function serializePathForImport(path: string) {
  // JSON.stringify is important here because it will escape windows style paths(and any thing else that might potentionally be in there)
  return JSON.stringify(
    path
      // Next is unhappy about imports that include .ts/tsx in them because TypeScript is unhappy with them becasue when doing a TypeScript compilation with tsc, the imports won't be written so they would be wrong there
      .replace(/\.tsx?$/, '')
  );
}

// FIXME: Duplicated from admin-ui package. Need to decide on a common home.
export const formatSource = (src: string, parser: 'babel' | 'babel-ts' = 'babel') =>
  prettier.format(src, { parser, trailingComma: 'es5', singleQuote: true });

const generateKeystoneConfig = async (projectAdminPath: string) => {
  // We re-export the Keystone config file into the Admin UI project folder
  // so that when we run the build step, we will end up with a compiled version
  // of the configuration file in the .next/ directory. Even if we're not building
  // an Admin UI, we still need to run the `build()` function so that this config
  // file is correctly compiled.
  const outputDir = Path.join(projectAdminPath, 'pages', 'api');
  const pathToConfig = Path.relative(outputDir, CONFIG_PATH);
  const file = `
    export { default as config } from ${serializePathForImport(pathToConfig)}
    export default function (req, res) {
      return res.status(500)
    }`;

  await fs.outputFile(Path.join(outputDir, '__keystone_api_build.js'), formatSource(file));
};

export async function build({ dotKeystonePath, projectAdminPath }: StaticPaths) {
  console.log('🤞 Building Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config, dotKeystonePath, 'build');

  console.log('✨ Generating graphQL schema');
  await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

  console.log('✨ Generating Admin UI code');
  await generateAdminUI(config, graphQLSchema, keystone, projectAdminPath);

  console.log('✨ Generating Keystone config code');
  await generateKeystoneConfig(projectAdminPath);

  console.log('✨ Building Admin UI');
  await buildAdminUI(projectAdminPath);

  console.log('✨ Generating database client');
  // FIXME: This should never generate a migratration... right?
  // FIXME: This needs to generate clients for the correct build target using binaryTarget
  // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
  if (keystone.adapter.name === 'prisma') {
    await keystone.adapter._generateClient(keystone._consolidateRelationships());
  }
}
