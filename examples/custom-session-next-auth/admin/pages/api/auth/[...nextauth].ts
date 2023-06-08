import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { getNextSession, onNextSignIn } from '../../../../session';
// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';

// see https://next-auth.js.org/configuration/options for more
export const authOptions = {
  secret: sessionSecret,
  callbacks: {
    signIn: onNextSignIn,
    session: getNextSession,
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};

export default NextAuth(authOptions);
