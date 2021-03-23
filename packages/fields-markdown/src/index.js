import { Text } from '@keystone-next/fields-legacy';

export let Markdown = {
  type: 'Markdown',
  implementation: Text.implementation,
  adapters: Text.adapters,
};
