import type { AdminConfig } from '@keystone-next/keystone/types';
import { CustomNavigation } from './components/CustomNavigation';
export const components: AdminConfig['components'] = {
  Navigation: CustomNavigation,
};
