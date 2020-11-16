/* @jsx jsx */

import { Fragment, ReactNode } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Brand = () => {
  const { palette } = useTheme();
  return (
    <h2>
      <Link href="/" passHref>
        <a
          css={{
            color: palette.neutral700,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          Keystone Next
        </a>
      </Link>
    </h2>
  );
};

type SectionProps = { label: string; children: ReactNode };
const Section = ({ label, children }: SectionProps) => {
  return (
    <Fragment>
      <h3>{label}</h3>
      <ul css={{ margin: 0, padding: 0 }}>{children}</ul>
    </Fragment>
  );
};

type NavItemProps = { href: string; children: ReactNode };
const NavItem = ({ href, children }: NavItemProps) => {
  const { palette, radii, spacing } = useTheme();
  const router = useRouter();
  const isSelected = router.pathname === href;
  return (
    <li
      css={{
        listStyle: 'none',
        marginLeft: 0,
        paddingLeft: 0,
      }}
    >
      <Link href={href} passHref>
        <a
          css={{
            color: isSelected ? palette.neutral800 : palette.neutral700,
            backgroundColor: isSelected ? palette.white : undefined,
            borderRadius: radii.medium,
            padding: spacing.small,
            display: 'block',
            textDecoration: 'none',
            ':hover': {
              color: isSelected ? undefined : palette.blue500,
              backgroundColor: isSelected ? undefined : palette.white,
            },
          }}
        >
          {children}
        </a>
      </Link>
    </li>
  );
};

export const Navigation = () => {
  return (
    <Fragment>
      <Brand />
      <Section label="Guides">
        <NavItem href="/guides/getting-started">Getting Started</NavItem>
      </Section>
    </Fragment>
  );
};
