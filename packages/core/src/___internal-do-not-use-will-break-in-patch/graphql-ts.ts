// this entry point purely exists so that we can essentially import from @graphql-ts/schema
// from .keystone when a user might be using a stricter package manager (e.g. pnpm)
// that doesn't allow importing things that you don't depend on yourself
// and users won't be directly depending on @graphql-ts/schema
export * from '@graphql-ts/schema';
