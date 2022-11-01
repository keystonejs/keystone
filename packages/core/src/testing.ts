import path from 'path';
import { createDatabase } from '@prisma/internals';
import { runMigrateWithDbUrl, withMigrate } from './lib/migrations';

export async function resetDatabase(dbUrl: string, prismaSchemaPath: string) {
  await createDatabase(dbUrl, path.dirname(prismaSchemaPath));
  await withMigrate(prismaSchemaPath, async migrate => {
    await runMigrateWithDbUrl(dbUrl, undefined, () => migrate.reset());
    await runMigrateWithDbUrl(dbUrl, undefined, () => migrate.push({ force: true }));
  });
}
