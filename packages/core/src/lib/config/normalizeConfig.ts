import { KeystoneConfig } from '../../types';

/*
  This function normalizes an input of KeystoneConfig or Promise<KeystoneConfig>
  and just returns Promise<KeystoneConfig>
*/

export async function normalizeConfig(config: KeystoneConfig | Promise<KeystoneConfig>) : Promise<KeystoneConfig> {
	return config;
}
