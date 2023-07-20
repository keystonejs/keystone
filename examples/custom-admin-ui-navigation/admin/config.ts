import { AdminConfig } from '@keystone-6/core/types';

export const disablePreventNavigation = process.env.NODE_ENV === 'development';

import { CustomNavigation } from './components/CustomNavigation';
export const components: AdminConfig['components'] = {
  Navigation: CustomNavigation,
};
