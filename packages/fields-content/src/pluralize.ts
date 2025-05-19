export function pluralize(
  count: number,
  options: { singular: string; plural?: string; inclusive?: boolean }
) {
  const { singular, plural = singular + 's', inclusive = true } = options;
  const variant = count === 1 ? singular : plural;
  return inclusive ? `${count} ${variant}` : variant;
}
