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
    async session({ session, token }) {
      console.log('Next Auth Session Details', { session, token });
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
