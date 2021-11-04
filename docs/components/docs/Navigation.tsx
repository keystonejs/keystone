/** @jsxRuntime classic */
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
import { Emoji } from '../primitives/Emoji';

type SectionProps = { label?: string; children: ReactNode };
export function Section({ label, children }: SectionProps) {
  return (
    <div
      css={{
        marginBottom: 'var(--space-xlarge)',
        marginTop: 'var(--space-xlarge)',
      }}
    >
      {label && (
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
      )}
      {children}
    </div>
  );
}

type NavItemProps = {
  href: string;
  isActive?: boolean;
  isPlaceholder?: boolean;
  alwaysVisible?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function NavItem({
  href,
  isActive: _isActive,
  isPlaceholder,
  alwaysVisible,
  ...props
}: NavItemProps) {
  const { pathname } = useRouter();
  const mq = useMediaQuery();
  const isActive = _isActive || pathname === href;
  const ctx = useHeaderContext();
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true;
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1;

  return (
    <Link href={href} passHref>
      <a
        {...(alwaysVisible ? {} : { tabIndex: isMobileNavOpen ? 0 : desktopOpenState })}
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
  const isActive = pathname === href;
  const ctx = useHeaderContext();
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true;
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1;

  return (
    <Link href={href} passHref>
      <a
        tabIndex={isMobileNavOpen ? 0 : desktopOpenState}
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
      <Section>
        <PrimaryNavItem href="/docs/examples">Examples</PrimaryNavItem>
        <NavItem href="/docs/examples/#base-projects">Basic</NavItem>
        <NavItem href="/docs/examples/#feature-projects">Feature</NavItem>
        <NavItem href="/docs/examples/#deployment-projects">Deployment</NavItem>
      </Section>
      <Section>
        <PrimaryNavItem href="/docs/guides">Guides</PrimaryNavItem>
        <NavItem href="/docs/guides/cli">Command Line</NavItem>
        <NavItem href="/docs/guides/relationships">Relationships</NavItem>
        <NavItem href="/docs/guides/filters">
          Query Filters <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/guides/hooks">
          Hooks <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/guides/auth-and-access-control">
          Auth and Access Control <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/schema-extension" isPlaceholder>
          Schema Extension
        </NavItem>
        <NavItem href="/docs/guides/testing">Testing</NavItem>
        <NavItem href="/docs/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/docs/guides/document-field-demo">Document Field Demo</NavItem>
        <NavItem href="/docs/guides/virtual-fields">Virtual Fields</NavItem>
        <NavItem href="/docs/guides/custom-fields">Custom Fields</NavItem>
        <NavItem href="/docs/guides/custom-field-views" isPlaceholder>
          Custom Field Views
        </NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-logo">Custom Admin UI Logo</NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-pages">Custom Admin UI Pages</NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-navigation">Custom Admin UI Navigation</NavItem>
      </Section>
      <Section>
        <PrimaryNavItem href="/docs/apis">APIs</PrimaryNavItem>
        <SubHeading>Config</SubHeading>
        <NavItem href="/docs/apis/config">Config API</NavItem>
        <NavItem href="/docs/apis/schema">Schema API</NavItem>
        <NavItem href="/docs/apis/fields">
          Fields API <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/apis/auth">Authentication API</NavItem>
        <NavItem href="/docs/apis/access-control">
          Access Control API <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/apis/hooks">
          Hooks API <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/apis/session">Session API</NavItem>

        <SubHeading>Context</SubHeading>
        <NavItem href="/docs/apis/context">Context API</NavItem>
        <NavItem href="/docs/apis/query">Query API</NavItem>
        <NavItem href="/docs/apis/db-items">DB API</NavItem>

        <SubHeading>GraphQL</SubHeading>
        <NavItem href="/docs/apis/graphql">
          GraphQL API <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/apis/filters">
          Query Filter API <Badge look="success">Updated</Badge>
        </NavItem>
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
      <Section label="Featured News">
        <NavItem href="/updates/new-access-control">
          <Emoji symbol="🔐" alt="Padlock" />
          &nbsp; New Access Control API
        </NavItem>
        <NavItem href="/updates/new-graphql-api">
          <Emoji symbol="💎" alt="Gemstone" />
          &nbsp; New GraphQL API
        </NavItem>
        <NavItem href="/releases/2021-07-29">
          <Emoji symbol="🎛️" alt="Control knobs" />
          &nbsp; Customisable Admin UI
        </NavItem>
        <NavItem href="/updates/prisma-day-2021">
          <Emoji symbol="🍿" alt="TV" />
          &nbsp; Jed’s Prisma Day Talk
        </NavItem>
        <NavItem href="/releases/2021-06-15">
          <Emoji symbol="⚙️" alt="Gear" />
          &nbsp; New Core
        </NavItem>
        <NavItem
          href="https://github.com/keystonejs/keystone/tree/main/examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Emoji symbol="🧪" alt="Test Tube" />
          &nbsp; New Examples Collection
        </NavItem>
        <NavItem href="/updates/keystone-5-vs-keystone-6-preview">
          <Emoji symbol="ℹ️" alt="Information" />
          &nbsp; Keystone 5 vs 6
        </NavItem>
      </Section>
    </nav>
  );
}
