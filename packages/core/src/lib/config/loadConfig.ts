import path from 'path';
import { generateDotKeystoneJSFile } from '../../artifacts';
import { KeystoneConfig } from '../../types';
import { initConfig } from './initConfig';
import { requireSource } from './requireSource';

export async function loadConfig(cwd: string): Promise<KeystoneConfig> {
  await generateDotKeystoneJSFile(cwd);
  return initConfig(requireSource(path.join(cwd, 'keystone')).default);
}
