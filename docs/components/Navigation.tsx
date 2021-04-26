/** @jsx jsx */
import { Fragment, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

type SectionProps = { label: string; children: ReactNode };
function Section({ label, children }: SectionProps) {
  return (
    <Fragment>
      <h3
        css={{
          textTransform: 'uppercase',
          margin: 'var(--space-xlarge) 0 var(--space-medium) 0',
          color: 'var(--gray-700)',
          fontWeight: 700,
        }}
      >
        {label}
      </h3>
      {children}
    </Fragment>
  );
}

type NavItemProps = { href: string; isPlaceholder?: boolean; children: ReactNode };
function NavItem({ href, isPlaceholder, children }: NavItemProps) {
  const router = useRouter();
  const isSelected = router.pathname === href;

  return (
    <Link href={href} passHref>
      <a
        css={{
          display: 'block',
          textDecoration: 'none',
          padding: 'var(--space-xsmall) 0',
          color: isSelected
            ? 'var(--gray-900)'
            : `${isPlaceholder ? 'var(--gray-300)' : 'var(--gray-500)'}`,
          ':hover': {
            color: 'var(--gray-800)',
          },
        }}
      >
        {children}
      </a>
    </Link>
  );
}

export function Navigation() {
  return (
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      <NavItem href="/">Welcome</NavItem>
      <NavItem href="/whats-new">What's New</NavItem>
      <NavItem href="/roadmap">Roadmap</NavItem>
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
        <NavItem href="/apis/list-items">List Item API</NavItem>
      </Section>
    </nav>
  );
}
