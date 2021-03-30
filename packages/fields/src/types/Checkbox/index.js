import { Checkbox, PrismaCheckboxInterface } from './Implementation';

export default {
  type: 'Checkbox',
  implementation: Checkbox,
  adapters: {
    prisma: PrismaCheckboxInterface,
  },
};
