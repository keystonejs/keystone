export const titleCase = (str, at = '-') => {
  if (!str) return str;

  const arr = str
    .toLowerCase()
    .split(at)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));

  return arr.join(' ');
};
