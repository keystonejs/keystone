import { AdminConfig } from '@keystone-6/core/types';
import { CustomLogo } from './components/CustomLogo';

// Presently the Logo is the only Admin UI component that is customisable.
export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
};
