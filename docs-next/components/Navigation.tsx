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

// const SubSection: React.ComponentType<{ label: string }> = ({ children, label }) => {
//   return (
//     <Fragment>
//       <h4
//         css={{
//           fontWeight: 500,
//           fontSize: '1em',
//           textTransform: 'uppercase',
//           margin: '0.5em 0',
//         }}
//       >
//         {label}
//       </h4>
//       <ul css={{ padding: 0 }}>{children}</ul>
//     </Fragment>
//   );
// };

export const Navigation = () => {
  return (
    <div className="font-medium">
      <NavItem href="/">Welcome</NavItem>
      <Section label="Guides">
        <NavItem href="/guides/getting-started">Getting Started</NavItem>
        <NavItem href="/guides/installation">Installation</NavItem>
        <NavItem href="/guides/cli">Command Line</NavItem>
        <NavItem href="/guides/access-control">Access Control</NavItem>
        <NavItem href="/guides/hooks">Hooks</NavItem>
        <NavItem href="/guides/schema-extension">Schema Extension</NavItem>
        <NavItem href="/guides/document">Document Fields</NavItem>
        <NavItem href="/guides/virtual">Virtual Fields</NavItem>
      </Section>
      <Section label="API">
        <NavItem href="/apis/config">Config API</NavItem>
        <NavItem href="/apis/schema">Schema API</NavItem>
        <NavItem href="/apis/fields">Fields API</NavItem>
        <NavItem href="/apis/access-control">Access Control API</NavItem>
        <NavItem href="/apis/hooks">Hooks API</NavItem>
        <NavItem href="/apis/session">Session API</NavItem>
        <NavItem href="/apis/context">Context API</NavItem>
        <NavItem href="/apis/graphql">GraphQL API</NavItem>
      </Section>
    </div>
  );
};
