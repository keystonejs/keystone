import { KeystoneConfig } from '@keystone-next/types';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/config/initConfig';

export function createListsAPI(config: KeystoneConfig, prismaClient: any) {
  const { createContext, connect } = createSystem(initConfig(config), prismaClient);
  connect();
  return createContext().sudo().lists;
}
