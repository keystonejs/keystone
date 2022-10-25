import { runMigrateWithDbUrl, withMigrate } from '../../lib/migrations';
import { loadBuiltConfig } from '../../lib/config/loadConfig';
import { ExitError } from '../utils';
import { getSchemaPaths } from '../../artifacts';

export async function checkMigrations(cwd: string) {
  const config = loadBuiltConfig(cwd);
  await withMigrate(getSchemaPaths(cwd).prisma, async migrate => {
    const evaluateDataLossResult = await runMigrateWithDbUrl(
      config.db.url,
      config.db.shadowDatabaseUrl,
      () => migrate.evaluateDataLoss()
    );
    if (evaluateDataLossResult.migrationSteps) {
      console.log('Migrations are out of date - run `keystone migrate generate` to update them');
      throw new ExitError(1);
    } else {
      console.log('✅ Migrations are up to date');
    }
  });
}
