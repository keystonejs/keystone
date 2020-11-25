import { promisify } from 'util';
import { randomBytes } from 'crypto';
import { transport, makeANiceEmail } from '../lib/mail';
import { getItems } from '@keystonejs/server-side-graphql-client';

export default async function requestReset(root: any, { email }: { email: string }, context: any) {
  const response = await getItems({
    context,
    where: { email },
    listKey: 'User',
    returnFields: 'id email',
  });

  const [user] = response;

  if (!user) {
    throw new Error(`No such user found for email ${email}`);
  }
  // 2. Set a reset token and expiry on that user
  const resetToken = (await promisify(randomBytes)(20)).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
  const res = await context.lists.User.updateOne({
      id: user.id,
      // data: { resetToken, resetTokenExpiry }
      // TODO: Expiry?
      data: { passwordResetToken: resetToken }
    });

  // 3. Email them that reset token
  const mailRes = await transport.sendMail({
    from: 'wes@wesbos.com',
    to: user.email,
    subject: 'Your Password Reset Token',
    html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
  });
  // // 4. Return the message
  return { message: 'Check your email!' };
}
