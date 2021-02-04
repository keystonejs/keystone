import React, { Fragment, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import cx from 'classnames';

type SectionProps = { label: string; children: ReactNode };
const Section = ({ label, children }: SectionProps) => {
  return (
    <Fragment>
      <h3 className="uppercase mt-6 mb-2 text-gray-700 font-bold">{label}</h3>
      {children}
    </Fragment>
  );
};

type NavItemProps = { href: string; children: ReactNode };
const NavItem = ({ href, children }: NavItemProps) => {
  const router = useRouter();
  const isSelected = router.pathname === href;
  return (
    <Link href={href} passHref>
      <a
        className={cx(
          isSelected ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800',
          'block no-underline py-1'
        )}
      >
        {children}
      </a>
    </Link>
  );
};

export const Navigation = () => {
  return (
    <div className="font-medium">
      <NavItem href="/">Welcome</NavItem>
      <Section label="Guides">
        <NavItem href="/guides/getting-started">Getting Started</NavItem>
        <NavItem href="/guides/installation">Installation</NavItem>
        <NavItem href="/guides/cli">Command Line</NavItem>
      </Section>
      <Section label="API">
        <NavItem href="/apis/system">System API</NavItem>
      </Section>
    </div>
  );
};
