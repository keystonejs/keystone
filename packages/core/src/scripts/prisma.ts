import esbuild from 'esbuild';
import execa from 'execa';
import { createSystem } from '../lib/createSystem';
import {
  getBuiltKeystoneConfiguration,
  generateTypescriptTypesAndPrisma,
  generatePrismaAndGraphQLSchemas,
} from '../artifacts';
import { getEsbuildConfig } from '../lib/esbuild';
import { ExitError } from './utils';

export async function prisma(cwd: string, args: string[], frozen: boolean) {
  if (frozen) {
    args = args.filter(arg => arg !== '--frozen');
  } else {
    await esbuild.build(getEsbuildConfig(cwd));
  }

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const config = getBuiltKeystoneConfiguration(cwd);
  const { graphQLSchema } = createSystem(config);

  if (frozen) {
    await validatePrismaAndGraphQLSchemas(cwd, config, graphQLSchema);
    console.log('✨ GraphQL and Prisma schemas are up to date');
  } else {
    await generatePrismaAndGraphQLSchemas(cwd, config, graphQLSchema); // TODO: rename to generateSchemas (or similar)
    console.log('✨ Generated GraphQL and Prisma schemas');
    await generateTypescriptTypesAndPrisma(cwd, config, graphQLSchema); // TODO: generate PrismaClientAndTypes (or similar)
  }

  const result = await execa('node', [require.resolve('prisma'), ...args], {
    cwd,
    stdio: 'inherit',
    reject: false,
    env: {
      ...process.env,
      DATABASE_URL: config.db.url,
      PRISMA_HIDE_UPDATE_MESSAGE: '1',
    },
  });

  if (result.exitCode !== 0) throw new ExitError(result.exitCode);
}
