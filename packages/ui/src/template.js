export default ({ template, data }) => {
  if (!template || !data || typeof data !== 'object') {
    // TODO: Be better
    console.warn(`Unable to render template (${template}) with data:`, data);
    return '';
  }
  const keys = Object.keys(data);
  // Only replace exact syntax with enumerable keys
  // Also allows spaces around key name
  const search = new RegExp(`{{\\s*(${keys.join('|')})\\s*}}`, 'g');
  return template.replace(search, (match, key) => data[key]);
};
