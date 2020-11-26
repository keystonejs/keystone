export const isDate = (value: string): boolean => {
  try {
    new Date(value).toISOString();
  } catch (e) {
    return false;
  }
  return true;
};
