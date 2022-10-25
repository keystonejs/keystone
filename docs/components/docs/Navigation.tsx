/** @jsxRuntime classic */
/** @jsx jsx */
import {
  AnchorHTMLAttributes,
  ReactNode,
  useState,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useMediaQuery } from '../../lib/media';
import { useHeaderContext } from '../Header';
import { Badge } from '../primitives/Badge';
import { ArrowR } from '../icons/ArrowR';

type NavContext = {
  isSectionCollapsed: (title: string) => boolean;
  collapseSection: (title: string) => void;
  expandSection: (title: string) => void;
};

const NavContext = createContext<NavContext | undefined>(undefined);

/* Save section collapse/expand states */
export const NavContextProvider = ({ children }: { children: ReactNode }) => {
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const contextValue = useMemo(() => {
    const collapseSection = (title: string) => {
      const isSectionAlreadyCollapsed = collapsedSections.includes(title);
      if (!isSectionAlreadyCollapsed) {
        setCollapsedSections([...collapsedSections, title]);
      }
    };
    const expandSection = (title: string) => {
      const isSectionAlreadyExpanded = !collapsedSections.includes(title);
      if (!isSectionAlreadyExpanded) {
        setCollapsedSections(collapsedSections.filter(cs => cs !== title));
      }
    };
    const isSectionCollapsed = (title: string) => {
      return collapsedSections.some(cs => cs === title);
    };

    return { isSectionCollapsed, collapseSection, expandSection };
  }, [collapsedSections, setCollapsedSections]);

  return <NavContext.Provider value={contextValue}>{children}</NavContext.Provider>;
};

const useNavContext = () => {
  const navContext = useContext(NavContext);
  if (navContext === undefined) {
    throw new Error('NavContextProvider is not wrapped in the tree');
  }

  return navContext;
};

type NavSectionProps = {
  title: string;
  children: ReactNode;
};

function NavSection({ title, children }: NavSectionProps) {
  const { isSectionCollapsed, collapseSection, expandSection } = useNavContext();
  const isCollapsed = isSectionCollapsed(title);
  return (
    <section>
      <button
        css={{
          display: 'inline-flex',
          height: 'auto',
          padding: 0,
          border: 'none',
          background: 'transparent',
          fontSize: '1rem',
          marginBottom: '1rem',
          alignItems: 'center',
          fontWeight: 700,
          cursor: 'pointer',
          color: 'var(--text-heading)',
          ':hover': {
            color: 'var(--link)',
          },
        }}
        onClick={() => (isCollapsed ? expandSection(title) : collapseSection(title))}
      >
        {title}
        <ArrowR
          css={{
            marginLeft: '0.25rem',
            width: '14px',
            transition: 'transform 150ms',
            ...(isCollapsed ? {} : { transform: 'rotate(90deg)' }),

            path: { strokeWidth: '0.125em' },
          }}
        />
      </button>

      <div
        css={{
          paddingLeft: 'var(--space-medium)',
          ...(isCollapsed ? { height: 0, overflow: 'hidden' } : { height: '100%' }),
        }}
      >
        {children}
      </div>
    </section>
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
  const { asPath } = useRouter();
  const mq = useMediaQuery();
  const isActive = typeof _isActive !== 'undefined' ? _isActive : asPath === href;
  const ctx = useHeaderContext();
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true;
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1;

  return (
    <Link
      href={href}
      {...(alwaysVisible ? {} : { tabIndex: isMobileNavOpen ? 0 : desktopOpenState })}
      css={mq({
        display: 'block',
        textDecoration: 'none',
        paddingBottom: '1rem',
        color: isActive
          ? 'var(--link)'
          : `${isPlaceholder ? 'var(--text-disabled)' : 'var(--text)'}`,
        ':hover': {
          color: 'var(--link)',
        },
      })}
      {...props}
    />
  );
}

type PrimaryNavItemProps = {
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function PrimaryNavItem({ href, children }: PrimaryNavItemProps) {
  const { asPath } = useRouter();
  const isActive = asPath === href;
  const ctx = useHeaderContext();
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true;
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1;

  return (
    <Link
      href={href}
      tabIndex={isMobileNavOpen ? 0 : desktopOpenState}
      css={{
        display: 'block',
        fontSize: '1rem',
        color: isActive ? 'var(--link)' : 'var(--text-heading)',
        marginBottom: '1rem',
        alignItems: 'center',
        fontWeight: 400,
        ':hover': {
          color: 'var(--link)',
        },
      }}
    >
      {children}
    </Link>
  );
}

export function DocsNavigation() {
  return (
    // <NavContextProvider>
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      <NavItem href="/docs">Docs Home</NavItem>
      <NavItem href="/docs/getting-started">Getting Started</NavItem>
      <NavItem href="/docs/walkthroughs">Walkthroughs</NavItem>
      <NavItem href="/docs/examples">Examples</NavItem>
      <NavSection title="Guides">
        <NavItem href="/docs/guides/overview">Overview</NavItem>
        <NavItem href="/docs/guides/cli">Command Line</NavItem>
        <NavItem href="/docs/guides/relationships">Relationships</NavItem>
        <NavItem href="/docs/guides/choosing-a-database">Choosing a Database</NavItem>
        <NavItem href="/docs/guides/database-migration">
          Database Migration <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/filters">
          Query Filters <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/guides/hooks">
          Hooks <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/guides/auth-and-access-control">
          Auth & Access Control <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/images-and-files">
          Images & Files <Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/schema-extension">
          GraphQL Schema Extension<Badge look="success">New</Badge>
        </NavItem>
        <NavItem href="/docs/guides/testing">Testing</NavItem>
        <NavItem href="/docs/guides/document-fields">Document Fields</NavItem>
        <NavItem href="/docs/guides/document-field-demo">Document Field Demo</NavItem>
        <NavItem href="/docs/guides/virtual-fields">Virtual Fields</NavItem>
        <NavItem href="/docs/guides/custom-fields">Custom Fields</NavItem>
        {/* Disable placeholder for now */}
        {/* <NavItem href="/docs/guides/custom-field-views" isPlaceholder>
          Custom Field Views
        </NavItem> */}
        <NavItem href="/docs/guides/custom-admin-ui-logo">Custom Admin UI Logo</NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-pages">Custom Admin UI Pages</NavItem>
        <NavItem href="/docs/guides/custom-admin-ui-navigation">Custom Admin UI Navigation</NavItem>
      </NavSection>
      <NavSection title="Configuration">
        <NavItem href="/docs/config/overview">Overview</NavItem>
        <NavItem href="/docs/config/config">Config</NavItem>
        <NavItem href="/docs/config/lists">Lists</NavItem>
        <NavItem href="/docs/config/auth">Authentication</NavItem>
        <NavItem href="/docs/config/access-control">
          Access Control <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/config/hooks">
          Hooks <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/config/session">Session</NavItem>
      </NavSection>

      <NavSection title="Fields">
        <NavItem href="/docs/fields/overview">Overview</NavItem>
        <NavItem href="/docs/fields/bigint">BigInt</NavItem>
        <NavItem href="/docs/fields/calendarday">Calendar Day</NavItem>
        <NavItem href="/docs/fields/checkbox">Checkbox</NavItem>
        <NavItem href="/docs/fields/cloudinaryimage">Cloudinary Image</NavItem>
        <NavItem href="/docs/fields/decimal">Decimal</NavItem>
        <NavItem href="/docs/fields/document">Document</NavItem>
        <NavItem href="/docs/fields/file">File</NavItem>
        <NavItem href="/docs/fields/float">Float</NavItem>
        <NavItem href="/docs/fields/image">Image</NavItem>
        <NavItem href="/docs/fields/integer">Integer</NavItem>
        <NavItem href="/docs/fields/json">JSON</NavItem>
        <NavItem href="/docs/fields/multiselect">Multiselect</NavItem>
        <NavItem href="/docs/fields/password">Password</NavItem>
        <NavItem href="/docs/fields/relationship">Relationship</NavItem>
        <NavItem href="/docs/fields/select">Select</NavItem>
        <NavItem href="/docs/fields/text">Text</NavItem>
        <NavItem href="/docs/fields/timestamp">Timestamp</NavItem>
        <NavItem href="/docs/fields/virtual">Virtual</NavItem>
      </NavSection>

      <NavSection title="Context">
        <NavItem href="/docs/context/overview">Overview</NavItem>
        <NavItem href="/docs/context/get-context">getContext</NavItem>
        <NavItem href="/docs/context/query">Query</NavItem>
        <NavItem href="/docs/context/db-items">DB</NavItem>
      </NavSection>

      <NavSection title="GraphQL">
        <NavItem href="/docs/graphql/overview">
          Overview <Badge look="success">Updated</Badge>
        </NavItem>
        <NavItem href="/docs/graphql/filters">
          Query Filters <Badge look="success">Updated</Badge>
        </NavItem>
      </NavSection>
      <NavSection title="Reference">
        <NavItem href="/docs/reference/telemetry">Telemetry</NavItem>
      </NavSection>
    </nav>
    // </NavContextProvider>
  );
}

export function UpdatesNavigation() {
  return (
    <NavContextProvider>
      <nav
        css={{
          fontWeight: 500,
        }}
      >
        <PrimaryNavItem href="/updates">Latest News</PrimaryNavItem>
        <PrimaryNavItem href="/updates/roadmap">Roadmap</PrimaryNavItem>
      </nav>
    </NavContextProvider>
  );
}
