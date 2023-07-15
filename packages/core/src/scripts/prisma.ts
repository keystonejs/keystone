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
  console.log('✨ Generating GraphQL and Prisma schemas');
  await generatePrismaAndGraphQLSchemas(cwd, config, graphQLSchema);
  await generateTypescriptTypesAndPrisma(cwd, config, graphQLSchema);

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
