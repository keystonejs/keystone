import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';

// see https://next-auth.js.org/configuration/options for more
export const authOptions = {
  secret: sessionSecret,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // We need to require the context here to avoid a circular dependency
      const sudoContext = require('../../../../context').sudo();
      // console.log('Next Auth Sign In Details', { user, account, profile });
      // check if the user exists in keystone
      const keystoneUser = await sudoContext.query.User.findOne({
        where: { subjectId: profile.id },
      });
      // if not, create them
      if (!keystoneUser) {
        await sudoContext.query.User.createOne({
          data: {
            subjectId: profile.id,
            name: profile.name,
          },
        });
      }
      // return true to allow the sign in to complete
      return true;
    },
    async session({ session, token }: any) {
      // console.log('Next Auth Session Details', { session, token });
      // add the users subjectId and email to the session object
      return { ...session, email: token.email, subjectId: token.sub };
    },
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};

export default NextAuth(authOptions);
