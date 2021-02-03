// @ts-ignore
// TODO: Type this mutation
export default async function resetPassword(parent, args: any, ctx, info, { query }: any) {
  console.log(args);
  // 1. check if the passwords match
  console.info('1. Checking is passwords match');
  if (args.password !== args.confirmPassword) {
    throw new Error("Yo Passwords don't match!");
  }
  // 2. check if its a legit reset token
  console.info('1. Checking if legit token');
  const userResponse = await query(`query {
    allUsers(where: {
      resetToken: "${args.resetToken}",
    }) {
      id
      resetTokenExpiry
    }
  }`);
  const [user] = userResponse.data.allUsers;
  if (!user) {
    throw new Error('This token is invalid.');
  }
  // 3. Check if its expired
  console.info('check if expired');
  const now = Date.now();
  const expiry = new Date(user.resetTokenExpiry).getTime();
  if (now >= expiry) {
    throw new Error('This token is expired');
  }
  // 4. Save the new password to the user and remove old resetToken fields
  console.log(`4. Saving new password`);
  const updatedUserResponse = await query(`
    mutation {
      updateUser(
        id: "${user.id}",
        data: {
          password: "${args.password}",
          resetToken: null,
          resetTokenExpiry: null,
        }
      ) {
        password_is_set
        name
      }
    }
  `);
  const { errors } = updatedUserResponse;
  if (errors) {
    throw new Error(errors);
  }
  console.info('Sending success response');
  return {
    message: 'Your password has been reset',
  };
}
