export function thing() {
  if (process.env.NODE_ENV !== 'production') {
    return 'not prod';
  }
  return 'prod';
}
