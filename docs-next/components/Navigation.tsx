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

type NavItemProps = { href: string; isPlaceholder?: boolean; children: ReactNode };
const NavItem = ({ href, isPlaceholder, children }: NavItemProps) => {
  const router = useRouter();
  const isSelected = router.pathname === href;
  return (
    <Link href={href} passHref>
      <a
        className={cx(
          isSelected ? 'text-gray-900' : `${isPlaceholder ? 'text-gray-300' : 'text-gray-500'}`,
          'block no-underline py-1 hover:text-gray-800'
        )}
      >
        {children}
      </a>
    </Link>
  );
};

export const Navigation = () => {
  return (
    <nav className="font-medium">
      <NavItem href="/">Welcome</NavItem>
      <NavItem href="/whats-new">What's New</NavItem>
      <NavItem href="/roadmap">Roadmap</NavItem>
      <NavItem href="/faqs">FAQs</NavItem>
      <Section label="Tutorials">
        <NavItem href="/tutorials/getting-started-with-create-keystone-app">
          Getting started
        </NavItem>
      </Section>
      <Section label="Guides">
        <NavItem href="/guides/keystone-5-vs-keystone-next">Keystone 5 vs Next</NavItem>
        <NavItem href="/guides/cli">Command Line</NavItem>
        <NavItem href="/guides/access-control" isPlaceholder>
          Access Control
        </NavItem>
        <NavItem href="/guides/hooks" isPlaceholder>
          Hooks
        </NavItem>
        <NavItem href="/guides/auth" isPlaceholder>
          Authentication
        </NavItem>
        <NavItem href="/guides/schema-extension" isPlaceholder>
          Schema Extension
        </NavItem>
        <NavItem href="/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/guides/virtual-fields" isPlaceholder>
          Virtual Fields
        </NavItem>
        <NavItem href="/guides/testing" isPlaceholder>
          Testing
        </NavItem>
      </Section>
      <Section label="API">
        <NavItem href="/apis/config">Config API</NavItem>
        <NavItem href="/apis/schema">Schema API</NavItem>
        <NavItem href="/apis/fields">Fields API</NavItem>
        <NavItem href="/apis/access-control">Access Control API</NavItem>
        <NavItem href="/apis/hooks"> Hooks API</NavItem>
        <NavItem href="/apis/session">Session API</NavItem>
        <NavItem href="/apis/auth">Authentication API</NavItem>
        <NavItem href="/apis/context">Context API</NavItem>
        <NavItem href="/apis/graphql">GraphQL API</NavItem>
        <NavItem href="/apis/list-items" isPlaceholder>
          List Item API
        </NavItem>
      </Section>
    </nav>
  );
};
