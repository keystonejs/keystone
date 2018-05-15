export default ({ template, data }) => {
  const keys = Object.keys(data);
  // Only replace exact syntax with enumerable keys
  // Also allows spaces around key name
  const search = new RegExp(`{{\\s*(${keys.join('|')})\\s*}}`, 'g');
  return template.replace(search, (match, key) => data[key]);
};
