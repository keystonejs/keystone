import { KeystoneConfig } from '../types';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/config/initConfig';

export function createListsAPI(config: KeystoneConfig, prismaClient: any) {
  const { getKeystone } = createSystem(initConfig(config));
  const keystone = getKeystone(prismaClient);
  keystone.connect();
  return keystone.createContext({ sudo: true }).lists;
}
