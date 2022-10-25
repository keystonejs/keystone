import { deployMigrations } from '../../lib/migrations';
import { loadBuiltConfig } from '../../lib/config/loadConfig';

export async function applyMigrations(cwd: string) {
  const config = loadBuiltConfig(cwd);
  await deployMigrations(config.db.url);
}
