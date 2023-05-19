import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

// See https://next-auth.js.org/configuration/options for more details on what goes in here
export const authOptions = {
  secret: '--DEV--COOKIE--SECRET--CHANGE--ME--==',
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
