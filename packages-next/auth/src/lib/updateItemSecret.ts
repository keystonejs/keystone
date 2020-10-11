import { AuthErrorCode } from '../types';

export async function updateItemSecret(
  list: any,
  itemId: string | number,
  secretPlaintext: string,
  secretField: string,
  ctx: any
): Promise<{
  code?: AuthErrorCode;
}> {
  // Save the provided secret
  const { errors } = await ctx.keystone.executeGraphQL({
    context: ctx.keystone.createContext({ skipAccessControl: true }),
    query: `mutation($itemId: String, $secretPlaintext: String) {
      ${list.gqlNames.updateMutationName}(id: $itemId, data: { ${secretField}: $secretPlaintext }) { id }
    }`,
    variables: { itemId, secretPlaintext },
  });

  // TODO: The underlying Password field will still hard error on validation failures; these should be surfaced better
  if (Array.isArray(errors) && errors.length > 0) {
    console.error(errors[0] && (errors[0].stack || errors[0].message));
    return { code: 'INTERNAL_ERROR' };
  }

  return {};
}
