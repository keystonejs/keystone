/** @jsx jsx */
import { Fragment, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

import { SubHeading } from './Heading';

type SectionProps = { label: string; children: ReactNode };
function Section({ label, children }: SectionProps) {
  return (
    <Fragment>
      <h3
        css={{
          textTransform: 'uppercase',
          margin: 'var(--space-xlarge) 0 var(--space-medium) 0',
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
            ? 'var(--text)'
            : `${isPlaceholder ? 'var(--text-disabled)' : 'var(--text)'}`,
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
      <NavItem href="/docs">Docs</NavItem>
      <NavItem href="/docs/releases">Releases</NavItem>
      <NavItem href="/docs/roadmap">Roadmap</NavItem>
      <Section label="Tutorials">
        <NavItem href="/docs/tutorials/getting-started-with-create-keystone-app">
          Getting started
        </NavItem>
        <NavItem href="/docs/tutorials/embedded-mode-with-sqlite-nextjs">
          Embedding Keystone and SQLite in Next.js
        </NavItem>
      </Section>
      <Section label="Guides">
        <NavItem href="/docs/guides/keystone-5-vs-keystone-next">Keystone 5 vs Next</NavItem>
        <NavItem href="/docs/guides/cli">Command Line</NavItem>
        <NavItem href="/docs/guides/relationships">Relationships</NavItem>
        <NavItem href="/docs/guides/filters">Query Filters</NavItem>
        <NavItem href="/docs/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/docs/guides/hooks">Hooks</NavItem>
        <NavItem href="/docs/guides/access-control" isPlaceholder>
          Access Control
        </NavItem>
        <NavItem href="/docs/guides/auth" isPlaceholder>
          Authentication
        </NavItem>
        <NavItem href="/docs/guides/schema-extension" isPlaceholder>
          Schema Extension
        </NavItem>
        <NavItem href="/docs/guides/virtual-fields" isPlaceholder>
          Virtual Fields
        </NavItem>
        <NavItem href="/docs/guides/internal-items" isPlaceholder>
          Internal Items
        </NavItem>
        <NavItem href="/docs/guides/testing" isPlaceholder>
          Testing
        </NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-pages" isPlaceholder>
          Custom Admin UI Pages
        </NavItem>
        <NavItem href="/docs/guides/custom-field-views" isPlaceholder>
          Custom Field Views
        </NavItem>
      </Section>
      <Section label="Examples">
        <NavItem href="/docs/examples">Examples</NavItem>
      </Section>
      <Section label="API">
        <SubHeading as="h4">Config</SubHeading>
        <NavItem href="/docs/apis/config">Config API</NavItem>
        <NavItem href="/docs/apis/schema">Schema API</NavItem>
        <NavItem href="/docs/apis/fields">Fields API</NavItem>
        <NavItem href="/docs/apis/access-control">Access Control API</NavItem>
        <NavItem href="/docs/apis/hooks"> Hooks API</NavItem>
        <NavItem href="/docs/apis/session">Session API</NavItem>
        <NavItem href="/docs/apis/auth">Authentication API</NavItem>

        <SubHeading as="h4">Context</SubHeading>
        <NavItem href="/docs/apis/context">Context API</NavItem>
        <NavItem href="/docs/apis/list-items">List Item API</NavItem>
        <NavItem href="/docs/apis/db-items">DB Item API</NavItem>

        <SubHeading as="h4">GraphQL</SubHeading>
        <NavItem href="/docs/apis/graphql">GraphQL API</NavItem>
        <NavItem href="/docs/apis/filters">Query Filter API</NavItem>
      </Section>
    </nav>
  );
}
