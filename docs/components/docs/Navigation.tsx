/** @jsx jsx */
import parseISO from 'date-fns/parseISO';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import format from 'date-fns/format';
import { ReactNode } from 'react';
import Link from 'next/link';

import { useHeaderContext } from '../Header';
import { Badge } from '../primitives/Badge';
import { Type } from '../primitives/Type';

type SectionProps = { label: string; children: ReactNode };
export function Section({ label, children }: SectionProps) {
  return (
    <div
      css={{
        marginBottom: 'var(--space-xlarge)',
      }}
    >
      <Type
        as="h3"
        look="body14bold"
        margin="0 0 var(--space-large) 0"
        color="var(--text-heading)"
        css={{ textTransform: 'uppercase' }}
      >
        {label}
      </Type>
      {children}
    </div>
  );
}

type NavItemProps = {
  href: string;
  isActive?: boolean;
  isPlaceholder?: boolean;
  children: ReactNode;
  exactMatch?: boolean;
};
export function NavItem({ href, isActive: _isActive, isPlaceholder, children }: NavItemProps) {
  const { pathname } = useRouter();
  let isActive = _isActive || pathname === href;
  const ctx = useHeaderContext();
  const isOpen = ctx ? ctx.open : true;

  return (
    <Link href={href} passHref>
      <a
        tabIndex={isOpen ? 0 : -1}
        css={{
          display: 'block',
          textDecoration: 'none',
          padding: '0 0 var(--space-medium) 0',
          color: isActive
            ? 'var(--link)'
            : `${isPlaceholder ? 'var(--text-disabled)' : 'var(--text)'}`,
          ':hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {children}
      </a>
    </Link>
  );
}

export function DocsNavigation() {
  return (
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      <Section label="Walkthroughs">
        <NavItem exactMatch href="/docs/walkthroughs/getting-started-with-create-keystone-app">
          Getting started
        </NavItem>
        <NavItem href="/docs/walkthroughs/embedded-mode-with-sqlite-nextjs">
          Embedding Keystone and SQLite in Next.js
        </NavItem>
      </Section>
      <Section label="Guides">
        <NavItem href="/docs/guides/keystone-5-vs-keystone-next">Keystone 5 vs Next</NavItem>
        <NavItem href="/docs/guides/cli">Command Line</NavItem>
        <NavItem href="/docs/guides/relationships">Relationships</NavItem>
        <NavItem href="/docs/guides/filters">Query Filters</NavItem>
        <NavItem href="/docs/guides/hooks">Hooks</NavItem>
        <NavItem href="/docs/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/docs/guides/virtual-fields">
          Virtual Fields <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/access-control" isPlaceholder>
          Access Control
        </NavItem>
        <NavItem href="/docs/guides/auth" isPlaceholder>
          Authentication
        </NavItem>
        <NavItem href="/docs/guides/schema-extension" isPlaceholder>
          Schema Extension
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
        <Type
          as="h4"
          look="body14bold"
          color="var(--muted)"
          margin="1.5rem 0 1rem 0"
          css={{ textTransform: 'uppercase' }}
        >
          Config
        </Type>
        <NavItem href="/docs/apis/config">Config API</NavItem>
        <NavItem href="/docs/apis/schema">Schema API</NavItem>
        <NavItem href="/docs/apis/fields">Fields API</NavItem>
        <NavItem href="/docs/apis/access-control">Access Control API</NavItem>
        <NavItem href="/docs/apis/hooks"> Hooks API</NavItem>
        <NavItem href="/docs/apis/session">Session API</NavItem>
        <NavItem href="/docs/apis/auth">Authentication API</NavItem>

        <Type
          as="h4"
          look="body14bold"
          color="var(--muted)"
          margin="1.5rem 0 1rem 0"
          css={{ textTransform: 'uppercase' }}
        >
          Context
        </Type>
        <NavItem href="/docs/apis/context">Context API</NavItem>
        <NavItem href="/docs/apis/list-items">List Item API</NavItem>
        <NavItem href="/docs/apis/db-items">DB Item API</NavItem>

        <Type
          as="h4"
          look="body14bold"
          color="var(--muted)"
          margin="1.5rem 0 1rem 0"
          css={{ textTransform: 'uppercase' }}
        >
          GraphQL
        </Type>
        <NavItem href="/docs/apis/graphql">GraphQL API</NavItem>
        <NavItem href="/docs/apis/filters">Query Filter API</NavItem>
      </Section>
    </nav>
  );
}

export function UpdatesNavigation({ releases = [] }: { releases: string[] }) {
  return (
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      <Section label="Updates">
        <NavItem href="/updates">Latest Updates</NavItem>
        <NavItem href="/updates/whats-new-in-v6">What's New in v6</NavItem>
        <NavItem href="/updates/roadmap">Roadmap</NavItem>
      </Section>
      <Section label="Releases">
        <NavItem href="/releases">Summary</NavItem>
        {releases.map(name => (
          <NavItem key={name} href={`/releases/${name}`}>
            {format(parseISO(name), 'do LLL yyyy')}
          </NavItem>
        ))}
      </Section>
    </nav>
  );
}

export function MarketingNavigation() {
  return <span>TODO</span>;
}
