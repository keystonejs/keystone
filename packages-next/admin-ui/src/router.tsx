/**
 * This file is exposed by the /router entrypoint, and helps ensure that other
 * packages import the same instance of next's router.
 */

export * from 'next/router';
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
