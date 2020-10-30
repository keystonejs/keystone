/**
 * This file is exposed by the /router entrypoint, and helps ensure that other
 * packages import the same instance of next's router.
 */

// not using export * because Rollup emits CJS code that redefines __esModule which causes problems because __esModule generally isn't a configurable property
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
