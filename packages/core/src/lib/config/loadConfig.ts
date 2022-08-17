import { getConfigPath } from '../../scripts/utils';
import { KeystoneConfig } from '../../types';
import { initConfig } from './initConfig';
import { requireSource } from './requireSource';

export async function loadConfig(cwd: string): Promise<KeystoneConfig> {
  return initConfig(requireSource(getConfigPath(cwd)).default);
}
