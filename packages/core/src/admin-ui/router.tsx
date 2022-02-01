/**
 * This file is exposed by the /router entrypoint, and helps ensure that other
 * packages import the same instance of next's router.
 */

// not using export * because Rollup's CJS re-export code doesn't ignore __esModule on the exports object so it will re-define it if it exists
// and since __esModule isn't configurable(at least with the code that's _generally_ emitted by Rollup, Babel, tsc and etc.)
// an error will be thrown
// that's normally not a problem because modules generally use Object.defineProperty(exports, '__esModule', { value: true })
// which means that the property isn't enumerable but Next uses Babel's loose mode and Babel's loose mode for the CJS transform
// uses exports.__esModule = true instead of defineProperty so the property is enumerable
export { createRouter, makePublicRouterInstance, Router, useRouter, withRouter } from 'next/router';
export type { NextRouter } from 'next/router';

import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React, { AnchorHTMLAttributes } from 'react';

export type LinkProps = Omit<NextLinkProps, 'passHref'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export const Link = ({ href, as, replace, scroll, shallow, prefetch, ...props }: LinkProps) => {
  return (
    <NextLink
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
    >
      <a {...props} />
    </NextLink>
  );
};
