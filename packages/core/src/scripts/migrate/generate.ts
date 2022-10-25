import { devMigrations } from '../../lib/migrations';
import { loadConfigOnce } from '../../lib/config/loadConfig';
import { createSystem } from '../../lib/createSystem';

import { generateCommittedArtifacts, getSchemaPaths } from '../../artifacts';

export async function generateMigrations(cwd: string, shouldDropDatabase: boolean) {
  const config = await loadConfigOnce(cwd);
  const { graphQLSchema } = createSystem(config);

  const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;

  await devMigrations(
    config.db.url,
    config.db.shadowDatabaseUrl,
    prismaSchema,
    getSchemaPaths(cwd).prisma,
    shouldDropDatabase
  );
}
