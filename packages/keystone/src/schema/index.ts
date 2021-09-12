// note: unlike the other places where we throw errors similar to this where a _package_ was moved
// this one shouldn't be removed immediately after a release with it happens because
// people might take a while to upgrade, this is imported by every Keystone project
// and the packages that were moved will be around with the error thrown regardless of us removing them from the repo but
// this will not so we should keep this for probably a couple months at least

throw new Error(
  'The exports of `@keystone-next/keystone/schema` have been moved to `@keystone-next/keystone`, please import from there instead.'
);

export {};
