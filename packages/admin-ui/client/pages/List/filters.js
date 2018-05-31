export const filterOptions = {
  default: [
    { label: 'Is exactly', value: '', invertedValue: '_not' },
    { label: 'Contains', value: '_contains', invertedValue: '_not_contains' },
    {
      label: 'Starts with',
      value: '_starts_with',
      invertedValue: '_not_starts_with',
    },
    {
      label: 'Ends with',
      value: '_ends_with',
      invertedValue: '_not_ends_with',
    },
  ],
  inverted: [
    { label: 'Is not exactly', value: '_not', invertedValue: '' },
    {
      label: 'Does not contain',
      value: '_not_contains',
      invertedValue: '_contains',
    },
    {
      label: 'Does not start with',
      value: '_not_starts_with',
      invertedValue: '_starts_with',
    },
    {
      label: 'Does not end with',
      value: '_not_ends_with',
      invertedValue: '_ends_with',
    },
  ],
};
export function getOptions({ isInverted }) {
  const type = isInverted ? 'inverted' : 'default';
  return filterOptions[type];
}
export function getOption({ isInverted, key }) {
  const type = isInverted ? 'inverted' : 'default';

  return filterOptions[type].find(opt => opt.value === key);
}
export function getInvertedOption({ isInverted, key }) {
  const type = isInverted ? 'inverted' : 'default';

  return filterOptions[type].find(opt => opt.invertedValue === key);
}
export function getQuery({ path, key, isInverted }) {
  const option = getOption({ isInverted, key });

  return `${path}${option.value}`;
}
