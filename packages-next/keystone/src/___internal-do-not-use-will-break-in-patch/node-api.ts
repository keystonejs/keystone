import { KeystoneConfig } from '@keystone-next/types';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';

export function createListsAPI(config: KeystoneConfig, prismaClient: any) {
  const { createContext, keystone } = createSystem(initConfig(config), prismaClient);
  keystone.connect();
  // this is doing bad things so that the lists api is available synchronously
  const rels = keystone._consolidateRelationships();
  keystone.adapter.postConnect({ rels });
  return createContext().sudo().lists;
}
