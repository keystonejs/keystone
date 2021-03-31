import { KeystoneConfig } from '@keystone-next/types';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';

export function createListsAPI(config: KeystoneConfig, prismaClient: any) {
  const { createContext, keystone } = createSystem(initConfig(config), prismaClient);
  keystone.connect();
  return createContext().sudo().lists;
}
