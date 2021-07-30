/** @jsx jsx */
import { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import parseISO from 'date-fns/parseISO';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import format from 'date-fns/format';
import Link from 'next/link';

import { useMediaQuery } from '../../lib/media';
import { useHeaderContext } from '../Header';
import { Badge } from '../primitives/Badge';
import { Type } from '../primitives/Type';

type SectionProps = { label: string; children: ReactNode };
export function Section({ label, children }: SectionProps) {
  return (
    <div
      css={{
        marginBottom: 'var(--space-xlarge)',
        marginTop: 'var(--space-xlarge)',
      }}
    >
      <Type
        as="h3"
        look="body16bold"
        margin="var(--space-xlarge) 0 var(--space-large) 0"
        color="var(--text-heading)"
        css={{
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
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
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function NavItem({ href, isActive: _isActive, isPlaceholder, ...props }: NavItemProps) {
  const { pathname } = useRouter();
  const mq = useMediaQuery();
  let isActive = _isActive || pathname === href;
  const ctx = useHeaderContext();
  const isOpen = ctx ? ctx.mobileNavIsOpen : true;

  return (
    <Link href={href} passHref>
      <a
        tabIndex={isOpen ? 0 : -1}
        css={mq({
          display: 'block',
          textDecoration: 'none',
          padding: [
            '0 0 var(--space-medium) 0 var(--space-medium)',
            '0 0 var(--space-medium) var(--space-medium)',
            null,
            '0 0 var(--space-large) var(--space-medium)',
          ],
          color: isActive
            ? 'var(--link)'
            : `${isPlaceholder ? 'var(--text-disabled)' : 'var(--text)'}`,
          ':hover': {
            color: 'var(--link)',
          },
        })}
        {...props}
      />
    </Link>
  );
}

type PrimaryNavItemProps = {
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function PrimaryNavItem({ href, children }: PrimaryNavItemProps) {
  const { pathname } = useRouter();
  let isActive = pathname === href;
  const ctx = useHeaderContext();
  const isOpen = ctx ? ctx.mobileNavIsOpen : true;

  return (
    <Link href={href} passHref>
      <a
        tabIndex={isOpen ? 0 : -1}
        css={{
          display: 'block',
          fontSize: '1rem',
          color: isActive ? 'var(--link)' : 'var(--text-heading)',
          marginBottom: '1rem',
          alignItems: 'center',
          fontWeight: 700,
          ':hover': {
            color: 'var(--link)',
          },
        }}
      >
        {children}
      </a>
    </Link>
  );
}

function SubHeading(props: HTMLAttributes<HTMLElement>) {
  return (
    <Type
      as="h4"
      look="body14bold"
      color="var(--muted)"
      margin="1.5rem 0 1rem 0"
      css={{ textTransform: 'uppercase' }}
      {...props}
    />
  );
}

export function DocsNavigation() {
  return (
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      <PrimaryNavItem href="/docs">Docs Home</PrimaryNavItem>
      <PrimaryNavItem href="/docs/walkthroughs">Walkthroughs</PrimaryNavItem>
      <PrimaryNavItem href="/docs/examples">Examples</PrimaryNavItem>
      <Section label="Guides">
        <NavItem href="/docs/guides/keystone-5-vs-keystone-6-preview">Keystone 5 vs 6</NavItem>
        <NavItem href="/docs/guides/cli">Command Line</NavItem>
        <NavItem href="/docs/guides/relationships">Relationships</NavItem>
        <NavItem href="/docs/guides/filters">Query Filters</NavItem>
        <NavItem href="/docs/guides/hooks">Hooks</NavItem>
        <NavItem href="/docs/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/docs/guides/document-field-demo">Document Field Demo</NavItem>
        <NavItem href="/docs/guides/virtual-fields">
          Virtual Fields <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/testing">
          Testing <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/custom-fields">
          Custom Fields <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-logo">
          Custom Admin UI Logo <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-pages">
          Custom Admin UI Pages <Badge look="success">New</Badge>
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
        <NavItem href="/docs/guides/custom-field-views" isPlaceholder>
          Custom Field Views
        </NavItem>
      </Section>
      <Section label="API">
        <SubHeading>Config</SubHeading>
        <NavItem href="/docs/apis/config">Config API</NavItem>
        <NavItem href="/docs/apis/schema">Schema API</NavItem>
        <NavItem href="/docs/apis/fields">Fields API</NavItem>
        <NavItem href="/docs/apis/access-control">Access Control API</NavItem>
        <NavItem href="/docs/apis/hooks"> Hooks API</NavItem>
        <NavItem href="/docs/apis/session">Session API</NavItem>
        <NavItem href="/docs/apis/auth">Authentication API</NavItem>

        <SubHeading>Context</SubHeading>
        <NavItem href="/docs/apis/context">Context API</NavItem>
        <NavItem href="/docs/apis/list-items">List Item API</NavItem>
        <NavItem href="/docs/apis/db-items">DB Item API</NavItem>

        <SubHeading>GraphQL</SubHeading>
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
      <PrimaryNavItem href="/updates">Latest News</PrimaryNavItem>
      <PrimaryNavItem href="/updates/roadmap">Roadmap</PrimaryNavItem>
      <PrimaryNavItem href="/releases">Release Notes</PrimaryNavItem>
      {releases.length ? (
        <Section label="Recent Releases">
          {releases.map(name => (
            <NavItem key={name} href={`/releases/${name}`}>
              {format(parseISO(name), 'do LLL yyyy')}
            </NavItem>
          ))}
        </Section>
      ) : null}
    </nav>
  );
}
